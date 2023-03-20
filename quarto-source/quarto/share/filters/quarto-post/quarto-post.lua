-- string.lua
-- Copyright (C) 2020 by RStudio, PBC


-- tests whether a string ends with another string
function endsWith(str, ending) 
  return ending == "" or str:sub(-#ending) == ending
end

function startsWith(str, starting) 
  return starting == "" or str:sub(1, #starting) == starting
end

-- trim a string
function trim(s)
  return (string.gsub(s, "^%s*(.-)%s*$", "%1"))
end

-- splits a string on a separator
function split(str, sep)
  local fields = {}
  
  local sep = sep or " "
  local pattern = string.format("([^%s]+)", sep)
  local _ignored = string.gsub(str, pattern, function(c) fields[#fields + 1] = c end)
  
  return fields
end

-- escape string by converting using Pandoc
function stringEscape(str, format)
  local doc = pandoc.Pandoc({pandoc.Para(str)})
  return pandoc.write(doc, format)
end

-- meta.lua
-- Copyright (C) 2020 by RStudio, PBC

-- read and replace the authors field
-- without reshaped data that has been 
-- restructured into the standard author
-- format
local kAuthorInput =  'authors'

-- we ensure that if 'institute' is specified, we normalize it into
-- and array in this value, which this can safely read and process
local kInstituteInput = 'institutes'

-- By default, simply replace the input structure with the 
-- normalized versions of the output
local kAuthorOutput = kAuthorInput

-- Where we'll write the normalized list of affiliations
local kAffiliationOutput = "affiliations"

-- Where we'll write the 'by-author' list of authors which
-- includes expanded affiliation information inline with the author
local kByAuthor = "by-author"

-- Where we'll write the 'by-affiliation' list of affiliations which
-- includes expanded author information inline with each affiliation
local kByAffiliation = "by-affiliation"
local kAuthors = "authors"

-- Properties that may appear on an individual author
local kId = 'id'
local kName = 'name'
local kUrl = 'url'
local kEmail = 'email'
local kFax = 'fax'
local kPhone = 'phone'
local kOrcid = 'orcid'
local kNote = 'note'
local kAcknowledgements = 'acknowledgements'
local kAffiliations = 'affiliations'
local kAffiliation = 'affiliation'
local kRef = 'ref'

-- attributes hold a list of strings which
-- represent true characteristics of the author
-- (for example, that they are the corresponding author)
-- the presence of a value means that it is true, the
-- absence of a value means that it is false
--
-- users can either write
-- attributes: [correspoding, is-equal-contributor]
-- or if attributes with these names are present (and truthy) 
-- on the author they will be collected into attributes.
-- For example-
--   author:
--     name: John Hamm
--     corresponding: true
--     is-equal-contributor: true
local kAttributes = 'attributes'

-- flag values for attributes (attributes is a list of 
-- flag names)
local kCorresponding = 'corresponding'
local kEqualContributor = 'equal-contributor'
local kDeceased = 'deceased'

-- metadata holds options that appear in the author key
-- that are not common to our author schema. we would like
-- to generally discourage this type of data since 
-- it will be difficult to reliably share across templates and
-- author representations, so we bucketize it here to 
-- suggest to users that this is 'other' data 
local kMetadata = 'metadata'

-- a name which will be structured into a name object that
-- look like:
-- name:
--   family:
--   given:
--   literal:
-- We can accept a literal string (which we parse to get the family and given)
-- or a structured object that declares all or some of the options directly
local kGivenName = 'given'
local kFamilyName = 'family'
local kLiteralName = 'literal'
local kDroppingParticle = 'dropping-particle'
local kNonDroppingParticle = 'non-dropping-particle'
local kNameFields = { kGivenName, kFamilyName, kLiteralName}

-- an affiliation which will be structured into a standalone
local kAffilName = 'name'
local kDepartment = 'department'
local kAddress = 'address'
local kCity = 'city'
local kRegion = 'region'
local kState = 'state'
local kCountry = 'country'
local kPostalCode = 'postal-code'

-- labels contains the suggested labels for the various elements which 
-- are localized and should correctly deal with plurals, etc...
local kLabels = 'labels'
local kAuthorLbl = 'authors'
local kAffiliationLbl = 'affiliations'
local kPublishedLbl = 'published'
local kModifiedLbl = 'modified'
local kDoiLbl = 'doi'
local kDescriptionLbl = 'description'
local kAbstractLbl = 'abstract'

-- affiliation fields that might be parsed into other fields
-- (e.g. if we see affiliation-url with author, we make that affiliation/url)
local kAffiliationUrl = 'affiliation-url'

-- Titles are the values that we will accept in metadata to override the
-- default value for the above labels (e.g. abstract-title will provide the label)
-- for the abstract
local kAuthorTitle = 'author-title'
local kAffiliationTitle = 'affiliation-title'
local kAbstractTitle = 'abstract-title'
local kDescriptionTitle = 'description-title'
local kPublishedTitle = 'published-title'
local kModifiedTitle = 'modified-title'
local kDoiTitle = 'doi-title'

-- Deal with bibliography configuration as well
local kBiblioConfig = 'biblio-config'

-- The field types for an author (maps the field in an author table)
-- to the way the field should be processed
local kAuthorNameFields = { kName }
local kAuthorSimpleFields = { kId, kUrl, kEmail, kFax, kPhone, kOrcid, kAcknowledgements }
local kAuthorAttributeFields = { kCorresponding, kEqualContributor, kDeceased }
local kAuthorAffiliationFields = { kAffiliation, kAffiliations }

-- Fields for affiliations (either inline in authors or 
-- separately in a affiliations key)
local kAffiliationFields = { kId, kAffilName, kDepartment, kAddress, kCity, kRegion, kCountry, kPostalCode, kUrl }

-- These affiliation fields will be mapped into 'region' 
-- (so users may also write 'state')
local kAffiliationAliasedFields = {
  [kState]=kRegion,
  [kAffiliationUrl]=kUrl
}

-- This field will be included with 'by-author' and 'by-affiliation' and provides
-- a simple incremental counter that can be used for things like note numbers
local kNumber = "number"

function processAuthorMeta(meta)
  -- prevents the front matter for markdown from containing
  -- all the rendered author information that we generate
  if _quarto.format.isMarkdownOutput() then
    meta[kAuthors] = nil
    return meta
  end

  -- prefer to render 'authors' if it is available
  local authorsRaw = meta[kAuthorInput]
  if meta[kAuthors] then
    authorsRaw = meta[kAuthors]
  end

  -- authors should be a table of tables (e.g. it should be an array of inlines or tables)
  -- if it isn't, transform it into one
  if type(authorsRaw) == "table" then
    if (type(authorsRaw[1]) ~= "table") then
      authorsRaw = {authorsRaw}
    end
  end


  -- the normalized authors
  local authors = {}

  -- the normalized affilations
  local affiliations = {}

  if authorsRaw then
    for i,v in ipairs(authorsRaw) do

      local authorAndAffiliations = processAuthor(v)

      -- initialize the author
      local author = authorAndAffiliations.author
      local authorAffils = authorAndAffiliations.affiliations

      -- assign an id to this author if one isn't defined
      local authorNumber = #authors + 1
      if author[kId] == nil then
        author[kId] = authorNumber
      end

      -- go through the affilations and add any to the list
      -- assigning an id if needed
      if authorAffils ~= nil then
        for i,v in ipairs(authorAffils) do
          local affiliation = maybeAddAffiliation(v, affiliations)
          setAffiliation(author, { ref=affiliation[kId] })
        end
      end

      -- add this author to the list of authors
      authors[authorNumber] = author
    end
  end

  -- Add any affiliations that are explicitly specified
  local affiliationsRaw = meta[kAffiliations]
  if affiliationsRaw then
    local explicitAffils = processAffiliation(nil, affiliationsRaw)
    if explicitAffils then
      for i,affiliation in ipairs(explicitAffils) do
        local addedAffiliation = maybeAddAffiliation(affiliation, affiliations)

        -- for any authors that are using this affiliation, fix up their reference
        if affiliation[kId] ~= addedAffiliation[kId] then
          remapAuthorAffiliations(affiliation[kId], addedAffiliation[kId], authors)
        end
      end
    end
  end

  -- process 'institute', which is used by revealjs and beamer
  -- because they bear no direct relation to the authors
  -- we will just use their position to attach them
  local instituteRaw = meta[kInstituteInput]
  if instituteRaw then
    for i,institute in ipairs(instituteRaw) do
      -- add the affiliation
      local affiliation = processAffilationObj({ name=institute })
      local addedAffiliation = maybeAddAffiliation(affiliation, affiliations)

      -- note the reference on the author
      -- if there aren't enough authors, attach the affiliations to the
      -- last author
      local author = authors[#authors]
      if i <= #authors then
        author = authors[i]
      end
      if author then
        setAffiliation(author, { ref=addedAffiliation[kId] })
      end
    end
  end

  -- validate that every author affiliation has a corresponding 
  -- affiliation defined in the affiliations key
  validateRefs(authors, affiliations)

  -- number the authors and affiliations
  for i,affil in ipairs(affiliations) do
    affil[kNumber] = i
  end
  for i,auth in ipairs(authors) do
    auth[kNumber] = i
  end

  -- Write the normalized data back to metadata
  if #authors ~= 0 then
    meta[kAuthorOutput] = authors
  end

  if #affiliations ~= 0 then
    meta[kAffiliationOutput] = affiliations
  end

  -- Write the de-normalized versions back to metadata
  if #authors ~= 0 then
    meta[kByAuthor] = byAuthors(authors, affiliations)
  end

  if #affiliations ~= 0 then
    meta[kByAffiliation] = byAffiliations(authors, affiliations)
  end

  -- Provide localized or user specified strings for title block elements
  meta = computeLabels(authors, affiliations, meta)

  -- Provide biblio-config if it isn't specified
  if meta[kBiblioConfig] == nil then
    meta[kBiblioConfig] = true
  end
  return meta
end

-- Add an affiliation to the list of affiliations if needed
-- and return either the exist affiliation, or the newly
-- added affiliation with a proper id
function maybeAddAffiliation(affiliation, affiliations)
  local existingAff = findMatchingAffililation(affiliation, affiliations)
  if existingAff == nil then
    local affiliationNumber = #affiliations + 1
    local affiliationId = 'aff-' .. affiliationNumber
    if affiliation[kId] == nil then
      affiliation[kId] = { pandoc.Str(affiliationId) }
    end
    affiliations[affiliationNumber] = affiliation
    return affiliation
  else
    return existingAff
  end
end

function validateRefs(authors, affiliations)
  -- iterate through affiliations and ensure that anything
  -- referenced by an author has a peer affiliation

  -- get the list of affiliation ids
  local affilIds = {}
  if affiliations then
    for i,affiliation in ipairs(affiliations) do
      affilIds[#affilIds + 1] = affiliation[kId]
    end
  end

  -- go through each author and their affiliations and 
  -- ensure that they are in the list
  for i,author in ipairs(authors) do
    if author[kAffiliations] then
      for i,affiliation in ipairs(author[kAffiliations]) do
        if not tcontains(affilIds, affiliation[kRef]) then
          error("Undefined affiliation '" .. pandoc.utils.stringify(affiliation[kRef]) .. "' for author '" .. pandoc.utils.stringify(author[kName][kLiteralName]) .. "'.")
          os.exit(1)
        end
      end
    end
  end
end

-- Processes an individual author into a normalized author
-- and normalized set of affilations
function processAuthor(value)
  -- initialize the author
  local author = pandoc.MetaMap({})
  author[kMetadata] = pandoc.MetaMap({})

  -- initialize their affilations
  local authorAffiliations = {}
  local affiliationUrl = nil

  if pandoc.utils.type(value) == 'Inlines' then
    -- The value is simply an array, treat them as the author name
    author.name = toName(value);
  else
    -- Process the field into the proper place in the author
    -- structure
    for authorKey, authorValue in pairs(value) do
      if tcontains(kAuthorNameFields, authorKey) then
        -- process any names
        author[authorKey] = toName(authorValue)
      elseif tcontains(kAuthorSimpleFields, authorKey) then
        -- process simple fields
        author[authorKey] = authorValue
      elseif tcontains(kAuthorAttributeFields, authorKey) then
        -- process a field into attributes (a field that appears)
        -- directly under the author
        if authorValue then
          setAttribute(author, pandoc.Str(authorKey))
        end
      elseif authorKey == kAttributes then
        -- process an explicit attributes key
        processAttributes(author, authorValue)
      elseif authorKey == kNote then
        processAuthorNote(author, authorValue)
      elseif tcontains(kAuthorAffiliationFields, authorKey) then
        -- process affiliations that are specified in the author
        authorAffiliations = processAffiliation(author, authorValue)
      elseif authorKey == kAffiliationUrl then
        affiliationUrl = authorValue
      else
        -- since we don't recognize this value, place it under
        -- metadata to make it accessible to consumers of this 
        -- data structure
        setMetadata(author, authorKey, authorValue)
      end
    end
  end

  -- If there is an affiliation url, forward that along
  if authorAffiliations and affiliationUrl then
    authorAffiliations[1][kUrl] = affiliationUrl
  end

  return {
    author=author,
    affiliations=authorAffiliations
  }
end

-- Processes an affiatiation into a normalized
-- affilation
function processAffiliation(author, affiliation)
  local affiliations = {}
  local pandocType = pandoc.utils.type(affiliation)
  if pandocType == 'Inlines' then
    -- The affiliations is simple a set of inlines, use this as the nam
    -- of a single affiliation
    affiliations[#affiliations + 1] = processAffilationObj({ name=affiliation })
  elseif pandocType == 'List' then
    for i, v in ipairs(affiliation) do
      if pandoc.utils.type(v) == 'Inlines' then
        -- This item is just a set inlines, use that as the name
        affiliations[#affiliations + 1] = processAffilationObj({ name=v })
      else
        local keys = tkeys(v)
        if keys and #keys == 1 and keys[1] == kRef then
          -- See if this is just an item with a 'ref', and if it is, just pass
          -- it through on the author
          if author then
            setAffiliation(author, v)
          end
        else
          -- This is a more complex affilation, process it
          affiliations[#affiliations + 1] = processAffilationObj(v)
        end
      end
    end
  elseif pandocType == 'table' then
    -- This is a more complex affilation, process it
    affiliations[#affiliations + 1] = processAffilationObj(affiliation)
  end



  return affiliations
end

-- Normalizes an affilation object into the properly
-- structured form
function processAffilationObj(affiliation)
  local affiliationNormalized = {}
  affiliationNormalized[kMetadata] = {}


  for affilKey, affilVal in pairs(affiliation) do
    if (tcontains(tkeys(kAffiliationAliasedFields), affilKey)) then
      affiliationNormalized[kAffiliationAliasedFields[affilKey]] = affilVal
    elseif tcontains(kAffiliationFields, affilKey) then
      affiliationNormalized[affilKey] = affilVal
    else
      affiliationNormalized[kMetadata][affilKey] = affilVal
    end
  end

  return affiliationNormalized;
end

-- Finds a matching affiliation by looking through a list
-- of affiliations (ignoring the id)
function findMatchingAffililation(affiliation, affiliations)
  for i, existingAffiliation in ipairs(affiliations) do

    -- an affiliation matches if the fields other than id
    -- are identical
    local matches = true
    for j, field in ipairs(kAffiliationFields) do
      if field ~= kId and matches then
        matches = affiliation[field] == existingAffiliation[field]
      end
    end

    -- This affiliation matches, return it
    if matches then
      return existingAffiliation
    end
  end
  return nil
end

-- Replaces an affiliation reference with a different id
-- (for example, if a reference to an affiliation is collapsed into a single
-- entry with a single id)
function remapAuthorAffiliations(fromId, toId, authors)
  for i, author in ipairs(authors) do
    for j, affiliation in ipairs(author[kAffiliations]) do
      local existingRefId = affiliation[kRef]
      if existingRefId == fromId then
        affiliation[kRef] = toId
      end
     end
  end
end

-- Process attributes onto an author
-- attributes may be a simple string, a list of strings
-- or a dictionary
function processAttributes(author, attributes)
  if tisarray(attributes) then
    -- process attributes as an array of values
    for i,v in ipairs(attributes) do
      if v then
        if v.t == "Str" then
          setAttribute(author, v)
        else
          for j, attr in ipairs(v) do
            setAttribute(author, attr)
          end
        end
      end
    end
  else
    -- process attributes as a dictionary
    for k,v in pairs(attributes) do
      if v then
        setAttribute(author, pandoc.Str(k))
      end
    end
  end
end

-- Process an author note (including numbering it)
local noteNumber = 1
function processAuthorNote(author, note)
  author[kNote] = {
    number=noteNumber,
    text=note
  }
  noteNumber = noteNumber + 1
end

-- Sets a metadata value, initializing the table if
-- it not yet defined
function setMetadata(author, key, value)
  author[kMetadata][key] = value
end

-- Sets an attribute, initializeing the table if
-- is not yet defined
function setAttribute(author, attribute)
  if not author[kAttributes] then
    author[kAttributes] = pandoc.MetaMap({})
  end

  local attrStr = pandoc.utils.stringify(attribute)
  -- Don't duplicate attributes
  if not author[kAttributes][attrStr] then
    author[kAttributes][attrStr] = pandoc.Str('true')
  end
end

function setAffiliation(author, affiliation)
  if not author[kAffiliations] then
    author[kAffiliations] = {}
  end
  author[kAffiliations][#author[kAffiliations] + 1] = affiliation
end


-- Converts name elements into a structured name
function toName(nameParts)
  if not tisarray(nameParts) then
    -- If the name is a table (e.g. already a complex object)
    -- just pick out the allowed fields and forward
    local name = {}
    for i,v in ipairs(kNameFields) do
      if nameParts[v] ~= nil then
        name[v] = nameParts[v]
      end
    end

    return normalizeName(name)
  else
    if #nameParts == 0 then
      return {}
    else
      return normalizeName({[kLiteralName] = nameParts})
    end
  end
end

-- normalizes a name value by parsing it into
-- family and given names
function normalizeName(name)
  -- no literal name, create one
  if name[kLiteralName] == nil then
    if name[kFamilyName] and name[kGivenName] then
      name[kLiteralName] = {}
      tappend(name[kLiteralName], name[kGivenName])
      tappend(name[kLiteralName], {pandoc.Space()})
      tappend(name[kLiteralName], name[kFamilyName])
    end
  end

  -- no family or given name, parse the literal and create one
  if name[kFamilyName] == nil or name[kGivenName] == nil then
    if name[kLiteralName] then
      local parsedName = bibtexParseName(name)
      if type(parsedName) == 'table' then
        if parsedName.given ~= nil then
          name[kGivenName] = {pandoc.Str(parsedName.given)}
        end
        if parsedName.family ~= nil then
          name[kFamilyName] = {pandoc.Str(parsedName.family)}
        end
        if name[kDroppingParticle] ~= nil then
          name[kDroppingParticle] = parsedName[kDroppingParticle]
        end
        if name[kNonDroppingParticle] ~= nil then
          name[kNonDroppingParticle] = parsedName[kNonDroppingParticle]
        end
      else
        if #name[kLiteralName] > 1 then
          -- bibtex parsing failed, just split on space
          name[kGivenName] = name[kLiteralName][1]
          name[kFamilyName] = trimspace(tslice(name[kLiteralName], 2))
        elseif name[kLiteralName] then
          -- what is this thing, just make it family name
          name[kFamilyName] = name[kLiteralName]
        end
      end
    end
  end
  return name
end

local kBibtexNameTemplate = [[
@misc{x,
  author = {%s}
}
]]

--- Returns a CSLJSON-like name table. BibTeX knows how to parse names,
--- so we leverage that.
function bibtexParseName(nameRaw)
  local bibtex = kBibtexNameTemplate:format(pandoc.utils.stringify(nameRaw))
  local references = pandoc.read(bibtex, 'bibtex').meta.references
  if references then
    local reference = references[1] --[[@as table<string,any>]]
    if reference then
      local authors = reference.author
      if authors then
        local name = authors[1]
        if type(name) ~= 'table' then
          return nameRaw
        else
          -- most dropping particles are really non-dropping
          if name['dropping-particle'] and not name['non-dropping-particle'] then
            name['non-dropping-particle'] = name['dropping-particle']
            name['dropping-particle'] = nil
          end
          return name
        end
      else
        return nameRaw
      end
    else
      return nameRaw
    end
  else
    return nameRaw
  end
end

function byAuthors(authors, affiliations)
  local denormalizedAuthors = deepCopy(authors)

  if denormalizedAuthors then
    for i, author in ipairs(denormalizedAuthors) do
      denormalizedAuthors[kNumber] = i
      local authorAffiliations = author[kAffiliations]
      if authorAffiliations then
        for j, affilRef in ipairs(authorAffiliations) do
          local id = affilRef[kRef]
          author[kAffiliations][j] = findAffiliation(id, affiliations)
        end
      end
    end
  end
  return denormalizedAuthors
end

function byAffiliations(authors, affiliations)
  local denormalizedAffiliations = deepCopy(affiliations)
  for i, affiliation in ipairs(denormalizedAffiliations) do
    local affilAuthor = findAuthors(affiliation[kId], authors)
    if affilAuthor then
      affiliation[kAuthors] = affilAuthor
    end
  end
  return denormalizedAffiliations
end

-- Finds a matching affiliation by id
function findAffiliation(id, affiliations)
  for i, affiliation in ipairs(affiliations) do
    if affiliation[kId][1].text == id[1].text then
      return affiliation
    end
  end
  return nil
end

-- Finds a matching author by id
function findAuthors(id, authors)
  local matchingAuthors = {}
  for i, author in ipairs(authors) do
    local authorAffils = author[kAffiliations]
    if authorAffils then
      for j, authorAffil in ipairs(authorAffils) do
        if authorAffil[kRef][1].text == id[1].text then
          matchingAuthors[#matchingAuthors + 1] = author
        end
      end
    end
  end
  return matchingAuthors
end

-- Resolve labels for elements into metadata
function computeLabels(authors, affiliations, meta)
  local language = param("language", nil);
  meta[kLabels] = {
    [kAuthorLbl] = {pandoc.Str("Authors")},
    [kAffiliationLbl] = {pandoc.Str("Affiliations")}
  }
  if #authors == 1 then
    meta[kLabels][kAuthorLbl] = {pandoc.Str(language["title-block-author-single"])}
  else
    meta[kLabels][kAuthorLbl] = {pandoc.Str(language["title-block-author-plural"])}
  end
  if meta[kAuthorTitle] then
    meta[kLabels][kAuthors] = meta[kAuthorTitle]
  end

  if #affiliations == 1 then
    meta[kLabels][kAffiliationLbl] = {pandoc.Str(language["title-block-affiliation-single"])}
  else
    meta[kLabels][kAffiliationLbl] = {pandoc.Str(language["title-block-affiliation-plural"])}
  end
  if meta[kAffiliationTitle] then
    meta[kLabels][kAffiliationLbl] = meta[kAffiliationTitle]
  end

  meta[kLabels][kPublishedLbl] = {pandoc.Str(language["title-block-published"])}
  if meta[kPublishedTitle] then
    meta[kLabels][kPublishedLbl] = meta[kPublishedTitle]
  end

  meta[kLabels][kModifiedLbl] = {pandoc.Str(language["title-block-modified"])}
  if meta[kModifiedTitle] then
    meta[kLabels][kModifiedLbl] = meta[kModifiedTitle]
  end

  meta[kLabels][kDoiLbl] = {pandoc.Str("Doi")}
  if meta[kDoiTitle] then
    meta[kLabels][kDoiLbl] = meta[kDoiTitle]
  end

  meta[kLabels][kAbstractLbl] = {pandoc.Str(language["section-title-abstract"])}
  if meta[kAbstractTitle] then
    meta[kLabels][kAbstractLbl] = meta[kAbstractTitle]
  end

  meta[kLabels][kDescriptionLbl] = {pandoc.Str(language["listing-page-field-description"])}
  if meta[kDescriptionTitle] then
    meta[kLabels][kDescriptionLbl] = meta[kDescriptionTitle]
  end

  return meta
end

-- Remove Spaces from the ends of tables
function trimspace(tbl)
  if #tbl > 0 then
    if tbl[1].t == 'Space' then
      tbl = tslice(tbl, 2)
    end
  end

  if #tbl > 0 then
    if tbl[#tbl].t == 'Space' then
      tbl = tslice(tbl, #tbl -1)
    end
  end
  return tbl
end

-- Deep Copy a table
function deepCopy(original)
	local copy = {}
	for k, v in pairs(original) do
		if type(v) == "table" then
			v = deepCopy(v)
		end
		copy[k] = v
	end
	return copy
end

-- debug.lua
-- Copyright (C) 2020 by RStudio, PBC

-- improved formatting for dumping tables
function tdump (tbl, indent, refs)
  if not refs then refs = {} end
  if not indent then indent = 0 end
  local address = string.format("%p", tbl)
  if refs[address] ~= nil then
    print(string.rep("  ", indent) .. "(circular reference to " .. address .. ")")
    return
  end

  if tbl.t then
    print(string.rep("  ", indent) .. tbl.t)
  end
  local empty = true
  for k, v in pairs(tbl) do
    empty = false
    formatting = string.rep("  ", indent) .. k .. ": "
    v = asLua(v)
    if type(v) == "table" then
      print(formatting .. "table: " .. address)
      refs[address] = true
      tdump(v, indent+1, refs)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))
    elseif (v ~= nil) then 
      print(formatting .. tostring(v))
    else 
      print(formatting .. 'nil')
    end
  end
  if empty then
    print(string.rep("  ", indent) .. "<empty table>")
  end
end

function asLua(o)
  if type(o) ~= 'userdata' then
    return o
  end
  
  if rawequal(o, PANDOC_READER_OPTIONS) then
    return {
      abbreviations = o.abbreviations,
      columns = o.columns,
      default_image_extension = o.default_image_extension,
      extensions = o.extensions,
      indented_code_classes = o.indented_code_classes,
      standalone = o.standalone,
      strip_comments = o.strip_comments,
      tab_stop = o.tab_stop,
      track_changes = o.track_changes,
    }
  elseif rawequal(o, PANDOC_WRITER_OPTIONS) then
    return {
      cite_method = o.cite_method,
      columns = o.columns,
      dpi = o.dpi,
      email_obfuscation = o.email_obfuscation,
      epub_chapter_level = o.epub_chapter_level,
      epub_fonts = o.epub_fonts,
      epub_metadata = o.epub_metadata,
      epub_subdirectory = o.epub_subdirectory,
      extensions = o.extensions,
      highlight_style = o.highlight_style,
      html_math_method = o.html_math_method,
      html_q_tags = o.html_q_tags,
      identifier_prefix = o.identifier_prefix,
      incremental = o.incremental,
      listings = o.listings,
      number_offset = o.number_offset,
      number_sections = o.number_sections,
      prefer_ascii = o.prefer_ascii,
      reference_doc = o.reference_doc,
      reference_links = o.reference_links,
      reference_location = o.reference_location,
      section_divs = o.section_divs,
      setext_headers = o.setext_headers,
      slide_level = o.slide_level,
      tab_stop = o.tab_stop,
      table_of_contents = o.table_of_contents,
      template = o.template,
      toc_depth = o.toc_depth,
      top_level_division = o.top_level_division,
      variables = o.variables,
      wrap_text = o.wrap_text
    }
  end
  v = tostring(o)
  if string.find(v, "^pandoc CommonState") then
    return {
      input_files = o.input_files,
      output_file = o.output_file,
      log = o.log,
      request_headers = o.request_headers,
      resource_path = o.resource_path,
      source_url = o.source_url,
      user_data_dir = o.user_data_dir,
      trace = o.trace,
      verbosity = o.verbosity
    }
  elseif string.find(v, "^pandoc LogMessage") then
    return v
  end
  return o
end

-- dump an object to stdout
local function dump(o)
  o = asLua(o)
  if type(o) == 'table' then
    tdump(o)
  else
    print(tostring(o) .. "\n")
  end
end

-- meta.lua
-- Copyright (C) 2020 by RStudio, PBC

-- constants
kHeaderIncludes = "header-includes"
kIncludeBefore = "include-before"
kIncludeAfter = "include-after"

function ensureIncludes(meta, includes)
  if not meta[includes] then
    meta[includes] = pandoc.List({})
  elseif pandoc.utils.type(meta[includes]) == "Inlines" or 
         pandoc.utils.type(meta[includes]) == "Blocks" then
    meta[includes] = pandoc.List({meta[includes]})
  end
end

function removeEmptyIncludes(meta, includes)
  if meta[includes] and 
     pandoc.utils.type(meta[includes]) == "List" and
     #meta[includes] == 0 then
    meta[includes] = nil
  end
end

function removeAllEmptyIncludes(meta)
  removeEmptyIncludes(meta, kHeaderIncludes)
  removeEmptyIncludes(meta, kIncludeBefore)
  removeEmptyIncludes(meta, kIncludeAfter)
end

-- add a header include as a raw block
function addInclude(meta, format, includes, include)
  if _quarto.format.isHtmlOutput() then
    blockFormat = "html"
  else
    blockFormat = format
  end  
  meta[includes]:insert(pandoc.Blocks({ pandoc.RawBlock(blockFormat, include) }))
end

-- conditionally include a package
function usePackage(pkg)
  return "\\@ifpackageloaded{" .. pkg .. "}{}{\\usepackage{" .. pkg .. "}}"
end

function usePackageWithOption(pkg, option)
  return "\\@ifpackageloaded{" .. pkg .. "}{}{\\usepackage[" .. option .. "]{" .. pkg .. "}}"
end

function metaInjectLatex(meta, func)
  if _quarto.format.isLatexOutput() then
    function inject(tex)
      addInclude(meta, "tex", kHeaderIncludes, tex)
    end
    inject("\\makeatletter")
    func(inject)
    inject("\\makeatother")
  end
end

function metaInjectLatexBefore(meta, func)
  metaInjectRawLatex(meta, kIncludeBefore, func)
end

function metaInjectLatexAfter(meta, func)
  metaInjectRawLatex(meta, kIncludeAfter, func)
end

function metaInjectRawLatex(meta, include, func)
  if _quarto.format.isLatexOutput() then
    function inject(tex)
      addInclude(meta, "tex", include, tex)
    end
    func(inject)
  end
end


function metaInjectHtml(meta, func)
  if _quarto.format.isHtmlOutput() then
    function inject(html)
      addInclude(meta, "html", kHeaderIncludes, html)
    end
    func(inject)
  end
end


function readMetaOptions(meta) 
  local options = {}
  for key,value in pairs(meta) do
    if type(value) == "table" and value.clone ~= nil then
      options[key] = value:clone()
    else
      options[key] = value
    end 
  end
  return options
end

-- figures.lua
-- Copyright (C) 2020 by RStudio, PBC

-- constants for figure attributes
kFigAlign = "fig-align"
kFigEnv = "fig-env"
kFigAlt = "fig-alt"
kFigPos = "fig-pos"
kFigCap = "fig-cap"
kFigScap = "fig-scap"
kResizeWidth = "resize.width"
kResizeHeight = "resize.height"


function isFigAttribute(name)
  return string.find(name, "^fig%-")
end

function figAlignAttribute(el)
  local default = pandoc.utils.stringify(
    param(kFigAlign, pandoc.Str("default"))
  )
  local align = attribute(el, kFigAlign, default)
  if align == "default" then
    align = default
  end
  return validatedAlign(align)
end

-- is this an image containing a figure
function isFigureImage(el)
  return hasFigureRef(el) and #el.caption > 0
end

-- is this a Div containing a figure
function isFigureDiv(el)
  if el.t == "Div" and hasFigureRef(el) then
    return refCaptionFromDiv(el) ~= nil
  else
    return discoverLinkedFigureDiv(el) ~= nil
  end
end

function discoverFigure(el, captionRequired)
  if el.t ~= "Para" then
    return nil
  end
  if captionRequired == nil then
    captionRequired = true
  end
  if #el.content == 1 and el.content[1].t == "Image" then
    local image = el.content[1]
    if not captionRequired or #image.caption > 0 then
      return image
    else
      return nil
    end
  else
    return nil
  end
end

function discoverLinkedFigure(el, captionRequired)
  if el.t ~= "Para" then
    return nil
  end
  if #el.content == 1 then 
    if el.content[1].t == "Link" then
      local link = el.content[1]
      if #link.content == 1 and link.content[1].t == "Image" then
        local image = link.content[1]
        if not captionRequired or #image.caption > 0 then
          return image
        end
      end
    end
  end
  return nil
end

function createFigureDiv(paraEl, fig)
  
  -- create figure div
  local figureDiv = pandoc.Div({})
 
  -- transfer identifier
  figureDiv.attr.identifier = fig.attr.identifier
  fig.attr.identifier = ""
  
  -- provide anonymous identifier if necessary
  if figureDiv.attr.identifier == "" then
    figureDiv.attr.identifier = anonymousFigId()
  end
  
  -- transfer classes
  figureDiv.attr.classes = fig.attr.classes:clone()
  tclear(fig.attr.classes)
  
  -- transfer fig. attributes
  for k,v in pairs(fig.attr.attributes) do
    if isFigAttribute(k) then
      figureDiv.attr.attributes[k] = v
    end
  end
  local attribs = tkeys(fig.attr.attributes)
  for _,k in ipairs(attribs) do
    if isFigAttribute(k) then
      fig.attr.attributes[k] = v
    end
  end
    
  --  collect caption
  local caption = fig.caption:clone()
  fig.caption = {}
  
  -- if the image is a .tex file we need to tex \input 
  if latexIsTikzImage(fig) then
    paraEl = pandoc.walk_block(paraEl, {
      Image = function(image)
        return latexFigureInline(image, preState)
      end
    })
  end
  
  -- insert the paragraph and a caption paragraph
  figureDiv.content:insert(paraEl)
  figureDiv.content:insert(pandoc.Para(caption))
  
  -- return the div
  return figureDiv
  
end

function discoverLinkedFigureDiv(el, captionRequired)
  if el.t == "Div" and 
     hasFigureRef(el) and
     #el.content == 2 and 
     el.content[1].t == "Para" and 
     el.content[2].t == "Para" then
    return discoverLinkedFigure(el.content[1], captionRequired)  
  end
  return nil
end

local anonymousCount = 0
function anonymousFigId()
  anonymousCount = anonymousCount + 1
  return "fig-anonymous-" .. tostring(anonymousCount)
end

function isAnonymousFigId(identifier)
  return string.find(identifier, "^fig%-anonymous-")
end

function isReferenceableFig(figEl)
  return figEl.attr.identifier ~= "" and 
         not isAnonymousFigId(figEl.attr.identifier)
end



function latexIsTikzImage(image)
  return _quarto.format.isLatexOutput() and string.find(image.src, "%.tex$")
end

function latexFigureInline(image, state)
  -- if this is a tex file (e.g. created w/ tikz) then use \\input
  if latexIsTikzImage(image) then
    
    -- be sure to inject \usepackage{tikz}
    state.usingTikz = true
    
    -- base input
    local input = "\\input{" .. image.src .. "}"
    
    -- apply resize.width and/or resize.height if specified
    local rw = attribute(image, kResizeWidth, attribute(image, "width", "!"))
    local rh = attribute(image, kResizeHeight, attribute(image, "height", "!"))

    -- convert % to linewidth
    rw = asLatexSize(rw)
    rh = asLatexSize(rh)

    if rw ~= "!" or rh ~= "!" then
      input = "\\resizebox{" .. rw .. "}{" .. rh .. "}{" .. input .. "}"
    end
    
    -- return inline
    return pandoc.RawInline("latex", input)
  else
    return image
  end
end




-- pandoc.lua
-- Copyright (C) 2020 by RStudio, PBC

function hasBootstrap() 
  local hasBootstrap = param("has-bootstrap", false)
  return hasBootstrap
end


-- read attribute w/ default
function attribute(el, name, default)
  for k,v in pairs(el.attr.attributes) do
    if k == name then
      return v
    end
  end
  return default
end

function removeClass(classes, remove)
  return classes:filter(function(clz) return clz ~= remove end)
end

function combineFilters(filters) 

  -- the final list of filters
  local filterList = {}
  for _, filter in ipairs(filters) do
    for key,func in pairs(filter) do

      -- ensure that there is a list for this key
      if filterList[key] == nil then
        filterList[key] = pandoc.List()
      end

      -- add the current function to the list
      filterList[key]:insert(func)
    end
  end

  local combinedFilters = {}
  for key,fns in pairs(filterList) do

    combinedFilters[key] = function(x) 
      -- capture the current value
      local current = x

      -- iterate through functions for this key
      for _, fn in ipairs(fns) do
        local result = fn(current)
        if result ~= nil then
          -- if there is a result from this function
          -- update the current value with the result
          current = result
        end
      end

      -- return result from calling the functions
      return current
    end
  end
  return combinedFilters
end

function inlinesToString(inlines)
  return pandoc.utils.stringify(pandoc.Span(inlines))
end

-- lua string to pandoc inlines
function stringToInlines(str)
  if str then
    return pandoc.List({pandoc.Str(str)})
  else
    return pandoc.List({})
  end
end

-- lua string with markdown to pandoc inlines
function markdownToInlines(str)
  if str then
    local doc = pandoc.read(str)
    return doc.blocks[1].content
  else
    return pandoc.List()
  end
end

function stripTrailingSpace(inlines)
  if #inlines > 0 then
    if inlines[#inlines].t == "Space" then
      return pandoc.List(tslice(inlines, 1, #inlines - 1))
    else
      return inlines
    end
  else
    return inlines
  end
end

-- non-breaking space
function nbspString()
  return pandoc.Str '\u{a0}'
end

-- the first heading in a div is sometimes the caption
function resolveHeadingCaption(div) 
  local capEl = div.content[1]
  if capEl ~= nil and capEl.t == 'Header' then
    div.content:remove(1)
    return capEl.content
  else 
    return nil
  end
end

local kBlockTypes = {
  "BlockQuote",
  "BulletList", 
  "CodeBlock ",
  "DefinitionList",
  "Div",
  "Header",
  "HorizontalRule",
  "LineBlock",
  "Null",
  "OrderedList",
  "Para",
  "Plain",
  "RawBlock",
  "Table"
}

function isBlockEl(el)
  return tcontains(kBlockTypes, el.t)
end

function isInlineEl(el)
  return not isBlockEl(el)
end

function compileTemplate(template, meta)
  local f = io.open(pandoc.utils.stringify(template), "r")
  if f then
    local contents = f:read("*all")
    f:close()
    -- compile the title block template
    local compiledTemplate = pandoc.template.compile(contents)
    local template_opts = pandoc.WriterOptions {template = compiledTemplate}  

    -- render the current document and read it to generate an AST for the
    -- title block
    local metaDoc = pandoc.Pandoc(pandoc.Blocks({}), meta)
    local rendered = pandoc.write(metaDoc, 'gfm', template_opts)

    -- read the rendered document 
    local renderedDoc = pandoc.read(rendered, 'gfm')

    return renderedDoc.blocks
  else
    fail('Error compiling template: ' .. template)
  end
end


-- layout.lua
-- Copyright (C) 2020 by RStudio, PBC

kLayoutAlign = "layout-align"
kLayoutVAlign = "layout-valign"
kLayoutNcol = "layout-ncol"
kLayoutNrow = "layout-nrow"
kLayout = "layout"


function layoutAlignAttribute(el, default)
  return validatedAlign(attribute(el, kLayoutAlign, default))
end

function layoutVAlignAttribute(el, default)
  return validatedVAlign(attribute(el, kLayoutVAlign, default))
end

function hasLayoutAttributes(el)
  local attribs = tkeys(el.attr.attributes)
  return attribs:includes(kLayoutNrow) or
         attribs:includes(kLayoutNcol) or
         attribs:includes(kLayout)
end

function isLayoutAttribute(key)
  return key == kLayoutNrow or
         key == kLayoutNcol or
         key == kLayout
end

-- locate an image in a layout cell
function figureImageFromLayoutCell(cellDivEl)
  for _,block in ipairs(cellDivEl.content) do
    local fig = discoverFigure(block, false)
    if not fig then
      fig = discoverLinkedFigure(block, false)
    end
    if not fig then
      fig = discoverLinkedFigureDiv(block, false)
    end
    if fig then
      return fig
    end
  end
  return nil
end


-- we often wrap a table in a div, unwrap it
function tableFromLayoutCell(cell)
  if #cell.content == 1 and cell.content[1].t == "Table" then
    return cell.content[1]
  else
    return nil
  end
end

-- resolve alignment for layout cell (default to center or left depending
-- on the content in the cell)
function layoutCellAlignment(cell, align)
  if not align then
    local image = figureImageFromLayoutCell(cell) 
    local tbl = tableFromLayoutCell(cell)
    if image or tbl then
      return "center"
    else
      return "left"
    end
  else
    return align
  end
end

-- does the layout cell have a ref parent
function layoutCellHasRefParent(cell)
  if hasRefParent(cell) then
    return true
  else
    local image = figureImageFromLayoutCell(cell)
    if image then
      return hasRefParent(image)
    end
  end
  return false
end

function sizeToPercent(size)
  if size then
    local percent = string.match(size, "^([%d%.]+)%%$")
    if percent then
      return tonumber(percent)
    end
  end
  return nil
end

function asLatexSize(size, macro)
  -- default to linewidth
  if not macro then
    macro = "linewidth"
  end
  -- see if this is a percent, if it is the conver 
  local percentSize = sizeToPercent(size)
  if percentSize then
    if percentSize == 100 then
      return "\\" .. macro
    else
      return string.format("%2.2f", percentSize/100) .. "\\" .. macro
    end
  else
    return size
  end
end

-- table.lua
-- Copyright (C) 2020 by RStudio, PBC

-- append values to table
function tappend(t, values)
  for i,value in pairs(values) do
    table.insert(t, value)
  end
end

-- prepend values to table
function tprepend(t, values)
  for i=1, #values do
   table.insert(t, 1, values[#values + 1 - i])
  end
end

-- slice elements out of a table
function tslice(t, first, last, step)
  local sliced = {}
  for i = first or 1, last or #t, step or 1 do
    sliced[#sliced+1] = t[i]
  end
  return sliced
end

-- is the table a simple array?
-- see: https://web.archive.org/web/20140227143701/http://ericjmritz.name/2014/02/26/lua-is_array/
function tisarray(t)
  local i = 0
  for _ in pairs(t) do
      i = i + 1
      if t[i] == nil then return false end
  end
  return true
end

-- map elements of a table
function tmap(tbl, f)
  local t = {}
  for k,v in pairs(tbl) do
      t[k] = f(v)
  end
  return t
end

-- does the table contain a value
function tcontains(t,value)
  if t and type(t)=="table" and value then
    for _, v in ipairs (t) do
      if v == value then
        return true
      end
    end
    return false
  end
  return false
end

-- clear a table
function tclear(t)
  for k,v in pairs(t) do
    t[k] = nil
  end
end

-- get keys from table
function tkeys(t)
  local keyset=pandoc.List({})
  local n=0
  for k,v in pairs(t) do
    n=n+1
    keyset[n]=k
  end
  return keyset
end

-- sorted pairs. order function takes (t, a,)
function spairs(t, order)
  -- collect the keys
  local keys = {}
  for k in pairs(t) do keys[#keys+1] = k end

  -- if order function given, sort by it by passing the table and keys a, b,
  -- otherwise just sort the keys
  if order then
      table.sort(keys, function(a,b) return order(t, a, b) end)
  else
      table.sort(keys)
  end

  -- return the iterator function
  local i = 0
  return function()
      i = i + 1
      if keys[i] then
          return keys[i], t[keys[i]]
      end
  end
end

---@diagnostic disable: undefined-field
--[[

 base64 -- v1.5.3 public domain Lua base64 encoder/decoder
 no warranty implied; use at your own risk

 Needs bit32.extract function. If not present it's implemented using BitOp
 or Lua 5.3 native bit operators. For Lua 5.1 fallbacks to pure Lua
 implementation inspired by Rici Lake's post:
   http://ricilake.blogspot.co.uk/2007/10/iterating-bits-in-lua.html

 author: Ilya Kolbin (iskolbin@gmail.com)
 url: github.com/iskolbin/lbase64

 COMPATIBILITY

 Lua 5.1+, LuaJIT

 LICENSE

 See end of file for license information.

--]]


local extract = _G.bit32 and _G.bit32.extract -- Lua 5.2/Lua 5.3 in compatibility mode
if not extract then
	if _G.bit then -- LuaJIT
		local shl, shr, band = _G.bit.lshift, _G.bit.rshift, _G.bit.band
		extract = function( v, from, width )
			return band( shr( v, from ), shl( 1, width ) - 1 )
		end
	elseif _G._VERSION == "Lua 5.1" then
		extract = function( v, from, width )
			local w = 0
			local flag = 2^from
			for i = 0, width-1 do
				local flag2 = flag + flag
				if v % flag2 >= flag then
					w = w + 2^i
				end
				flag = flag2
			end
			return w
		end
	else -- Lua 5.3+
		extract = load[[return function( v, from, width )
			return ( v >> from ) & ((1 << width) - 1)
		end]]()
	end
end


function base64_makeencoder( s62, s63, spad )
	local encoder = {}
	for b64code, char in pairs{[0]='A','B','C','D','E','F','G','H','I','J',
		'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y',
		'Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
		'o','p','q','r','s','t','u','v','w','x','y','z','0','1','2',
		'3','4','5','6','7','8','9',s62 or '+',s63 or'/',spad or'='} do
		encoder[b64code] = char:byte()
	end
	return encoder
end

function base64_makedecoder( s62, s63, spad )
	local decoder = {}
	for b64code, charcode in pairs( base64_makeencoder( s62, s63, spad )) do
		decoder[charcode] = b64code
	end
	return decoder
end

local DEFAULT_ENCODER = base64_makeencoder()
local DEFAULT_DECODER = base64_makedecoder()

local char, concat = string.char, table.concat

function base64_encode( str, encoder, usecaching )
	encoder = encoder or DEFAULT_ENCODER
	local t, k, n = {}, 1, #str
	local lastn = n % 3
	local cache = {}
	for i = 1, n-lastn, 3 do
		local a, b, c = str:byte( i, i+2 )
		local v = a*0x10000 + b*0x100 + c
		local s
		if usecaching then
			s = cache[v]
			if not s then
				s = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[extract(v,0,6)])
				cache[v] = s
			end
		else
			s = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[extract(v,0,6)])
		end
		t[k] = s
		k = k + 1
	end
	if lastn == 2 then
		local a, b = str:byte( n-1, n )
		local v = a*0x10000 + b*0x100
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[64])
	elseif lastn == 1 then
		local v = str:byte( n )*0x10000
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[64], encoder[64])
	end
	return concat( t )
end

function base64_decode( b64, decoder, usecaching )
	decoder = decoder or DEFAULT_DECODER
	local pattern = '[^%w%+%/%=]'
	if decoder then
		local s62, s63
		for charcode, b64code in pairs( decoder ) do
			if b64code == 62 then s62 = charcode
			elseif b64code == 63 then s63 = charcode
			end
		end
		pattern = ('[^%%w%%%s%%%s%%=]'):format( char(s62), char(s63) )
	end
	b64 = b64:gsub( pattern, '' )
	local cache = usecaching and {}
	local t, k = {}, 1
	local n = #b64
	local padding = b64:sub(-2) == '==' and 2 or b64:sub(-1) == '=' and 1 or 0
	for i = 1, padding > 0 and n-4 or n, 4 do
		local a, b, c, d = b64:byte( i, i+3 )
		local s
		if usecaching then
			local v0 = a*0x1000000 + b*0x10000 + c*0x100 + d
			s = cache[v0]
			if not s then
				local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40 + decoder[d]
				s = char( extract(v,16,8), extract(v,8,8), extract(v,0,8))
				cache[v0] = s
			end
		else
			local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40 + decoder[d]
			s = char( extract(v,16,8), extract(v,8,8), extract(v,0,8))
		end
		t[k] = s
		k = k + 1
	end
	if padding == 1 then
		local a, b, c = b64:byte( n-3, n-1 )
		local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40
		t[k] = char( extract(v,16,8), extract(v,8,8))
	elseif padding == 2 then
		local a, b = b64:byte( n-3, n-2 )
		local v = decoder[a]*0x40000 + decoder[b]*0x1000
		t[k] = char( extract(v,16,8))
	end
	return concat( t )
end

--[[
------------------------------------------------------------------------------
This software is available under 2 licenses -- choose whichever you prefer.
------------------------------------------------------------------------------
ALTERNATIVE A - MIT License
Copyright (c) 2018 Ilya Kolbin
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------
ALTERNATIVE B - Public Domain (www.unlicense.org)
This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this
software, either in source code form or as a compiled binary, for any purpose,
commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication to be an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------------
--]]

-- log.lua
-- Copyright (C) 2020 by RStudio, PBC

-- TODO
-- could write to named filed (e.g. <docname>.filter.log) and client could read warnings and delete (also delete before run)
-- always append b/c multiple filters

function info(message)
  io.stderr:write(message .. "\n")
end

function warn(message) 
  io.stderr:write(lunacolors.yellow("WARNING: " .. message .. "\n"))
end

function error(message)
  io.stderr:write(lunacolors.red("ERROR: " .. message .. "\n"))
end


-- lunacolors.lua
--
-- Copyright (c) 2021, Hilbis
-- https://github.com/Rosettea/Lunacolors

lunacolors = {}

function init(name, codes)
	lunacolors[name] = function(text)
		return ansi(codes[1], codes[2], text)
	end
end

function ansi(open, close, text)
	if text == nil then return '\27[' .. open .. 'm' end
	return '\27[' .. open .. 'm' .. text .. '\27[' .. close .. 'm'
end

-- Define colors
-- Modifiers
init('reset', {0, 0})
init('bold', {1, 22})
init('dim', {2, 22})
init('italic', {3, 23})
init('underline', {4, 24})
init('invert', {7, 27})
init('hidden', {8, 28})
init('strikethrough', {9, 29})

-- Colors
init('black', {30, 39})
init('red', {31, 39})
init('green', {32, 39})
init('yellow', {33, 39})
init('blue', {34, 39})
init('magenta', {35, 39})
init('cyan', {36, 39})
init('white', {37, 39})

-- Background colors
init('blackBg', {40, 49})
init('redBg', {41, 49})
init('greenBg', {42, 49})
init('yellowBg', {43, 49})
init('blueBg', {44, 49})
init('magentaBg', {45, 49})
init('cyanBg', {46, 49})
init('whiteBg', {47, 49})

-- Bright colors
init('brightBlack', {90, 39})
init('brightRed', {91, 39})
init('brightGreen', {92, 39})
init('brightYellow', {93, 39})
init('brightBlue', {94, 39})
init('brightMagenta', {95, 39})
init('brightCyan', {96, 39})
init('brightWhite', {97, 39})

-- Bright background 
init('brightBlackBg', {100, 49})
init('brightRedBg', {101, 49})
init('brightGreenBg', {102, 49})
init('brightYellowBg', {103, 49})
init('brightBlueBg', {104, 49})
init('brightMagentaBg', {105, 49})
init('brightCyanBg', {106, 49})
init('brightWhiteBg', {107, 49})

lunacolors.version = '0.1.0'
lunacolors.format = function(text)
	local colors = {
		reset = {'{reset}', ansi(0)},
		bold = {'{bold}', ansi(1)},
		dim = {'{dim}', ansi(2)},
		italic = {'{italic}', ansi(3)},
		underline = {'{underline}', ansi(4)},
		invert = {'{invert}', ansi(7)},
		bold_off = {'{bold-off}', ansi(22)},
		underline_off = {'{underline-off}', ansi(24)},
		black = {'{black}', ansi(30)},
		red = {'{red}', ansi(31)},
		green = {'{green}', ansi(32)},
		yellow = {'{yellow}', ansi(33)},
		blue = {'{blue}', ansi(34)},
		magenta = {'{magenta}', ansi(35)},
		cyan = {'{cyan}', ansi(36)},
		white = {'{white}', ansi(37)},
		red_bg = {'{red-bg}', ansi(41)},
		green_bg = {'{green-bg}', ansi(42)},
		yellow_bg = {'{green-bg}', ansi(43)},
		blue_bg = {'{blue-bg}', ansi(44)},
		magenta_bg = {'{magenta-bg}', ansi(45)},
		cyan_bg = {'{cyan-bg}', ansi(46)},
		white_bg = {'{white-bg}', ansi(47)},
		gray = {'{gray}', ansi(90)},
		bright_red = {'{bright-red}', ansi(91)},
		bright_green = {'{bright-green}', ansi(92)},
		bright_yellow = {'{bright-yellow}', ansi(93)},
		bright_blue = {'{bright-blue}', ansi(94)},
		bright_magenta = {'{bright-magenta}', ansi(95)},
		bright_cyan = {'{bright-cyan}', ansi(96)}
	}

	for k, v in pairs(colors) do
		text = text:gsub(v[1], v[2])
	end

	return text .. colors['reset'][2]
end

-- book.lua
-- Copyright (C) 2020 by RStudio, PBC

--- Removes notes and links
local function clean (inlines)
  return inlines:walk {
    Note = function (_) return {} end,
    Link = function (link) return link.content end,
  }
end

--- Creates an Inlines singleton containing the raw LaTeX.
local function l(text)
  return pandoc.Inlines{pandoc.RawInline('latex', text)}
end

-- inject metadata
function quartoBook()
  return {
    Header = function(el) 
      if (quarto.doc.is_format("pdf") and param("single-file-book", false)) then
          -- Works around https://github.com/jgm/pandoc/issues/1632
          -- See https://github.com/quarto-dev/quarto-cli/issues/2412
          if el.level <= 2 and el.classes:includes 'unnumbered' then
            local title = clean(el.content)
            local secmark = el.level == 1
              and l'\\markboth{' .. title .. l'}{' .. title .. l'}'
              or l'\\markright{' .. title .. l'}' -- subsection, keep left mark unchanged
            return {el, secmark}
          end
      end
    end,
    CodeBlock = function(el)

      -- If this is a title block cell, we should render it
      -- using the template
      if el.attr.classes:includes('quarto-title-block') then

        -- read the contents of the code cell
        -- this should just be some metadata 
        local renderedDoc = pandoc.read(el.text, 'markdown')

        -- render the title block using the metdata and
        -- and the template
        local template = el.attr.attributes['template']

        -- process any author information
        local processedMeta = processAuthorMeta(renderedDoc.meta)

        -- read the title block template
        local renderedBlocks = compileTemplate(template, processedMeta)

        if #renderedBlocks ~= 0 then
          local emptyLine = pandoc.LineBreak()
          renderedBlocks:insert(emptyLine)
        end 

        return renderedBlocks
      end
    end
  }
end


-- delink.lua
-- Copyright (C) 2021 by RStudio, PBC

local kDelinkClass = 'delink'

function delink() 
  return {
    -- Removes links from any divs marked with 'delink' class
    Div = function(div)
      if _quarto.format.isHtmlOutput() and div.attr.classes:includes(kDelinkClass) then

        -- remove the delink class 
        for i, clz in ipairs(div.attr.classes) do 
          if clz == kDelinkClass then
            div.attr.classes:remove(i)
          end
        end

        -- find links and transform them to spans
        return pandoc.walk_block(div, {
          Link = function(link)
            return pandoc.Span(link.content)
          end
        })
      end
    end
  }
end

-- meta.lua
-- Copyright (C) 2020 by RStudio, PBC

-- inject metadata
function quartoPostMetaInject()
  return {
    Meta = function(meta)
      metaInjectLatex(meta, function(inject)
        if postState.usingTikz then
          inject(usePackage("tikz"))
        end
      end)
      
      -- Purge the twitter card / creator metadata
      -- Citeproc interprets this as a cite, and provides
      -- a warning of unresolve citation. But we know
      -- that a citation is never allowed in the creator field
      if meta.website ~= nil and meta.website['twitter-card'] ~= nil and type(meta.website['twitter-card']) == 'table' then
        meta.website['twitter-card'].creator = nil
        meta.website['twitter-card'].site = nil
      end

      return meta
    end
  }
end


-- tikz.lua
-- Copyright (C) 2021 by RStudio, PBC

function tikz()
  if _quarto.format.isLatexOutput() then
    return {
      Image = function(image)
        if latexIsTikzImage(image) then
          return latexFigureInline(image, postState)
        end
      end
    }
  else
    return {}
  end
end

-- reveal.lua
-- Copyright (C) 2021 by RStudio, PBC

function reveal()
  if _quarto.format.isRevealJsOutput() then
    return combineFilters{
      {
        Div = applyPosition,
        Span = applyPosition,
        Image = applyPosition
      },
      {
        Div = fencedDivFix
      }
    }
  else
    return {}
  end
end

function applyPosition(el)
  if el.attr.classes:includes("absolute") then
    -- translate position attributes into style
    local style = el.attr.attributes['style']
    if style == nil then
      style = ''
    end
    local attrs = pandoc.List({ "top", "left", "bottom", "right", "width", "height" })
    for _, attr in ipairs(attrs) do
      local value = el.attr.attributes[attr]
      if value ~= nil then
        style = style .. attr .. ': ' .. asCssSize(value) .. '; '
        el.attr.attributes[attr] = nil
      end
    end
    el.attr.attributes['style'] = style
    return el
  end
end

function asCssSize(size)
  local number = tonumber(size)
  if number ~= nil then
    return tostring(number) .. "px"
  else
    return size
  end
end

function fencedDivFix(el)
  -- to solve https://github.com/quarto-dev/quarto-cli/issues/976
  -- until Pandoc may deal with it https://github.com/jgm/pandoc/issues/8098
  if el.content[1] and el.content[1].t == "Header" and el.attr.classes:includes("fragment") then
    level = PANDOC_WRITER_OPTIONS.slide_level
    if level and el.content[1].level > level then
      -- This will prevent Pandoc to create a <section>
      el.content:insert(1, pandoc.RawBlock("html", "<!-- -->"))
    end
  end
  return el
end

-- ojs.lua
-- Copyright (C) 2020 by RStudio, PBC

function ojs()

  local uid = 0
  local cells = pandoc.List()

  function uniqueId()
    uid = uid + 1
    return "ojs-element-id-" .. uid
  end

  function ojsInline(src)
    local id = uniqueId()
    cells:insert({
        src = src,
        id = id,
        inline = true
    })
    return pandoc.Span('', { id = id })
  end

  function isInterpolationOpen(str)
    if str.t ~= "Str" then
      return false
    end
    return str.text:find("${")
  end

  function isInterpolationClose(str)
    if str.t ~= "Str" then
      return false
    end
    return str.text:find("}")
  end

  function findArgIf(lst, fun, start)
    if start == nil then
      start = 1
    end
    local sz = #lst
    for i=start, sz do
      if fun(lst[i]) then
        return i
      end
    end
    return nil
  end

  function escapeSingle(str)
    local sub, _ = string.gsub(str, "'", "\\\\'")
    return sub
  end

  function escapeDouble(str)
    local sub, _ = string.gsub(str, '"', '\\\\"')
    return sub
  end

  function stringifyTokenInto(token, sequence)
    function unknown()
      fail("Don't know how to handle token " .. token.t)
    end
    if     token.t == 'Cite' then
      unknown()
    elseif token.t == 'Code' then
      sequence:insert('`')
      sequence:insert(token.text)
      sequence:insert('`')
    elseif token.t == 'Emph' then
      sequence:insert('*')
      sequence:insert(token.text)
      sequence:insert('*')
    elseif token.t == 'Image' then
      unknown()
    elseif token.t == 'LineBreak' then
      sequence:insert("\n")
    elseif token.t == 'Link' then
      unknown()
    elseif token.t == 'Math' then
      unknown()
    elseif token.t == 'Note' then
      unknown()
    elseif token.t == 'Quoted' then
      if token.quotetype == 'SingleQuote' then
        sequence:insert("'")
        local innerContent = stringifyTokens(token.content)
        sequence:insert(escapeSingle(innerContent))
        sequence:insert("'")
      else
        sequence:insert('"')
        local innerContent = stringifyTokens(token.content)
        sequence:insert(escapeDouble(innerContent))
        sequence:insert('"')
      end
    elseif token.t == 'RawInline' then
      sequence:insert(token.text)
    elseif token.t == 'SmallCaps' then
      unknown()
    elseif token.t == 'SoftBreak' then
      sequence:insert("\n")
    elseif token.t == 'Space' then
      sequence:insert(" ")
    elseif token.t == 'Span' then
      stringifyTokenInto(token.content, sequence)
    elseif token.t == 'Str' then
      sequence:insert(token.text)
    elseif token.t == 'Strikeout' then
      unknown()
    elseif token.t == 'Strong' then
      sequence:insert('**')
      sequence:insert(token.text)
      sequence:insert('**')
    elseif token.t == 'Superscript' then
      unknown()
    elseif token.t == 'Underline' then
      sequence:insert('_')
      sequence:insert(token.text)
      sequence:insert('_')
    else
      unknown()
    end
  end
  
  function stringifyTokens(sequence)
    local result = pandoc.List()
    for i = 1, #sequence do
      stringifyTokenInto(sequence[i], result)
    end
    return table.concat(result, "")
  end

  function escape_quotes(str)
    local sub, _ = string.gsub(str, '\\', '\\\\')
    sub, _ = string.gsub(sub, '"', '\\"')
    sub, _ = string.gsub(sub, "'", "\\'")
    sub, _ = string.gsub(sub, '`', '\\\\`')
    return sub
  end
  
  function inlines_rec(inlines)
    -- FIXME I haven't tested this for nested interpolations
    local i = findArgIf(inlines, isInterpolationOpen)
    while i do
      if i then
        local j = findArgIf(inlines, isInterpolationClose, i)
        if j then
          local is, ie = inlines[i].text:find("${")
          local js, je = inlines[j].text:find("}")
          local beforeFirst = inlines[i].text:sub(1, is - 1)
          local firstChunk = inlines[i].text:sub(ie + 1, -1)
          local lastChunk = inlines[j].text:sub(1, js - 1)
          local afterLast = inlines[j].text:sub(je + 1, -1)

          local slice = {pandoc.Str(firstChunk)}
          local slice_i = 2
          for k=i+1, j-1 do
            slice[slice_i] = inlines[i+1]
            slice_i = slice_i + 1
            inlines:remove(i+1)
          end
          slice[slice_i] = pandoc.Str(lastChunk)
          inlines:remove(i+1)
          inlines[i] = pandoc.Span({
              pandoc.Str(beforeFirst),
              ojsInline(stringifyTokens(slice)),
              pandoc.Str(afterLast)
          })
        end
        -- recurse
        i = findArgIf(inlines, isInterpolationOpen, i+1)
      end
    end
    return inlines
  end  

  if (param("ojs", false)) then
    return {
      Inlines = function (inlines)
        return inlines_rec(inlines)
      end,
      
      Pandoc = function(doc)
        if uid > 0 then
          doc.blocks:insert(pandoc.RawBlock("html", "<script type='ojs-module-contents'>"))
          doc.blocks:insert(pandoc.RawBlock("html", '{"contents":['))
          for i, v in ipairs(cells) do
            local inlineStr = ''
            if v.inline then
              inlineStr = 'true'
            else
              inlineStr = 'false'
            end
            if i > 1 then
              doc.blocks:insert(",")
            end
            doc.blocks:insert(
              pandoc.RawBlock(
                "html",
                ('  {"methodName":"interpret","inline":"true","source":"htl.html`<span>${' ..
                 escape_quotes(v.src) .. '}</span>`", "cellName":"' .. v.id .. '"}')))
          end
          doc.blocks:insert(pandoc.RawBlock("html", ']}'))
          doc.blocks:insert(pandoc.RawBlock("html", "</script>"))
        end
        return doc
      end,
      
      Str = function(el)
        local b, e, s = el.text:find("${(.+)}")
        if s then
          return pandoc.Span({
              pandoc.Str(string.sub(el.text, 1, b - 1)),
              ojsInline(s),
              pandoc.Str(string.sub(el.text, e + 1, -1))
          })
        end
      end
    }
  else 
    return {}
  end

end

-- ipynb.lua
-- Copyright (C) 2021 by RStudio, PBC


function ipynb()
  if FORMAT == "ipynb" then
    return {

      Pandoc = function(doc)

        -- pandoc doesn'tx handle front matter title/author/date when creating ipynb
        -- so do that manually here. note that when we make authors more 
        -- sophisticated we'll need to update this code

        -- read the title block template
        local titleBlockTemplate = param('ipynb-title-block')

        -- render the title block template
        local renderedBlocks = compileTemplate(titleBlockTemplate, doc.meta)

        -- prepend the blocks to the notebook
        tprepend(doc.blocks, renderedBlocks)

        return doc
        
      end,

      Div = function(el)
        if el.attr.classes:includes('cell') then
          el.attr.classes:insert('code')
        end
        el.attr.classes = fixupCellOutputClasses(
          el.attr.classes, 
          'cell-output-stdout', 
          { 'stream', 'stdout' }
        )
        el.attr.classes = fixupCellOutputClasses(
          el.attr.classes, 
          'cell-output-stderr', 
          { 'stream', 'stderr' }
        )
        el.attr.classes = fixupCellOutputClasses(
          el.attr.classes, 
          'cell-output-display', 
          { 'display_data' }
        )
        el.attr.classes = removeClass(el.attr.classes, 'cell-output')
        return el
      end,
    
      CodeBlock = function(el)
        if (el.attr.classes:includes('cell-code')) then
          el.attr.classes = removeClass(el.attr.classes, 'cell-code')
        end
      end,

      -- remove image classes/attributes (as this causes Pandoc to write raw html, which in turn
      -- prevents correct handling of attachments in some environments including VS Code)
      Image = function(el)
        el.attr = pandoc.Attr()
        return el
      end,

      -- note that this also catches raw blocks inside display_data 
      -- but pandoc seems to ignore the .cell .raw envelope in this
      -- case and correctly produce text/html cell output
      RawBlock = function(el)
        local rawDiv = pandoc.Div(
          { el }, 
          pandoc.Attr("", { "cell", "raw" })
        )
        return rawDiv
      end
    }
  else
    return {}
  end
end

function fixupCellOutputClasses(classes, cellOutputClass, outputClasses)
  if classes:includes(cellOutputClass) then
    classes = removeClass(classes, cellOutputClass)
    classes:insert("output")
    tappend(classes, outputClasses)
  end
  return classes
end

function readMetadataInlines(meta, key)
  val = meta[key]
  if type(val) == "boolean" then
    return { pandoc.Str( tostring(val) ) } 
  elseif type(val) == "string" then
    return stringToInlines(val)     
  elseif pandoc.utils.type(val) == "Inlines" then
    return val
  else
   return nil
  end
end

-- fig-cleanup.lua
-- Copyright (C) 2021 by RStudio, PBC


local function stripFigAnonymous(el)
  if isAnonymousFigId(el.attr.identifier) then
    el.attr.identifier = ""
    return el
  end
end

function figCleanup() 
  return {
    Div = stripFigAnonymous,
    Image = stripFigAnonymous
  }
end



-- foldcode.lua
-- Copyright (C) 2021 by RStudio, PBC

function foldCode()
  return {
    CodeBlock = function(block)
      if _quarto.format.isHtmlOutput() or _quarto.format.isMarkdownWithHtmlOutput() then
        if block.attr.classes:includes("cell-code") then
          local fold = foldAttribute(block)
          local summary = summaryAttribute(block)
          if fold ~= nil or summary ~= nil then
            block.attr.attributes["code-fold"] = nil
            block.attr.attributes["code-summary"] = nil
            if fold ~= "none" then 
              local blocks = pandoc.List()
              postState.codeFoldingCss =  _quarto.format.isHtmlOutput()
              local open = ""
              if fold == "show" then
                open = " open"
              end
              local style = ""
              if block.attr.classes:includes("hidden") then
                style = ' class="hidden"'
              end
              local beginPara = pandoc.Plain({
                pandoc.RawInline("html", "<details" .. open .. style .. ">\n<summary>"),
              })
              
              if not isEmpty(summary) then
                tappend(beginPara.content, markdownToInlines(summary))
              end
              beginPara.content:insert(pandoc.RawInline("html", "</summary>"))
              blocks:insert(beginPara)
              blocks:insert(block)
              blocks:insert(pandoc.RawBlock("html", "</details>"))
              return blocks
            else
              return block
            end
          end
        end
      end
    end
  }
end

function isEmpty(str) 
  return str == nil or string.len(trim(str)) == 0
end

function foldAttribute(el)
  local default = param("code-fold")
  if default then
    default = pandoc.utils.stringify(default)
  else
    default = "none"
  end
  local fold = attribute(el, "code-fold", default)
  if fold == true or fold == "true" or fold == "1" then
    return "hide"
  elseif fold == nil or fold == false or fold == "false" or fold == "0" then
    return "none"
  else
    return tostring(fold)
  end
end

function summaryAttribute(el)
  local default = param("code-summary")
  if default then
    default = pandoc.utils.stringify(default)
  else
    default = "Code"
  end
  return attribute(el, "code-summary", default)
end




--[[
     A Pandoc 2 Lua filter converting Pandoc native divs to LaTeX environments
     Author: Romain Lesur, Christophe Dervieux, and Yihui Xie
     License: Public domain
     Ported from: https://github.com/rstudio/rmarkdown/blob/80f14b2c6e63dcb8463df526354f4cd4fc72fd04/inst/rmarkdown/lua/latex-div.lua
--]]

function latexDiv()
  return {
    Div = function (divEl)
      -- look for 'latex' or 'data-latex' and at least 1 class
      local options = attribute(divEl, 'latex', attribute(divEl, 'data-latex'))
      if not options or #divEl.attr.classes == 0 then
        return nil
      end
      
      -- if the output format is not latex, remove the attr and return
      if not _quarto.format.isLatexOutput() then
        divEl.attributes['latex'] = nil
        divEl.attributes['data-latex'] = nil
        return divEl
      end
      
      -- if it's "1" or "true" then just set it to empty string
      if options == "1" or pandoc.text.lower(options) == "true" then
        options = ""
      end
    
      -- environment begin/end
      local env = divEl.classes[1]
      local beginEnv = '\\begin' .. '{' .. env .. '}' .. options
      local endEnv = '\n\\end{' .. env .. '}'
      
      -- if the first and last div blocks are paragraphs then we can
      -- bring the environment begin/end closer to the content
      if divEl.content[1].t == "Para" and divEl.content[#divEl.content].t == "Para" then
        table.insert(divEl.content[1].content, 1, pandoc.RawInline('tex', beginEnv .. "\n"))
        table.insert(divEl.content[#divEl.content].content, pandoc.RawInline('tex', "\n" .. endEnv))
      else
        table.insert(divEl.content, 1, pandoc.RawBlock('tex', beginEnv))
        table.insert(divEl.content, pandoc.RawBlock('tex', endEnv))
      end
      return divEl
    end
  }

end

-- responsive.lua
-- Copyright (C) 2021 by RStudio, PBC

function responsive() 
  return {
    -- make images responsive (unless they have an explicit height attribute)
    Image = function(image)
      if _quarto.format.isHtmlOutput() and param('fig-responsive', false) then
        if not image.attr.attributes["height"] and not image.attr.attributes["data-no-responsive"] then
          image.attr.classes:insert("img-fluid")
          return image
        end
      end
    end
  }
end


-- quarto-post.lua
-- Copyright (C) 2020 by RStudio, PBC

-- required version
PANDOC_VERSION:must_be_at_least '2.13'

-- global state
postState = {}



return {
  foldCode(),
  combineFilters({
    latexDiv(),
    responsive(),
    ipynb(),
    quartoBook(),
    reveal(),
    tikz(),
    delink(),
    figCleanup()
  }),
  ojs(),
  quartoPostMetaInject(),
}



