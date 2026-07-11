#!/usr/bin/env ruby

require "json"
require "yaml"

ROOT = File.expand_path("..", __dir__)
SKILL_FILES = Dir[File.join(ROOT, "skills", "*", "*", "SKILL.md")].sort
PROMOTED_BUCKETS = %w[engineering productivity].freeze
ALLOWED_FRONTMATTER = %w[
  name
  description
  argument-hint
  disable-model-invocation
].freeze
ALLOWED_AGENT_KEYS = %w[interface policy dependencies].freeze
ALLOWED_INTERFACE_KEYS = %w[
  display_name
  short_description
  icon_small
  icon_large
  brand_color
  default_prompt
].freeze

errors = []
user_invoked_count = 0

def load_frontmatter(path)
  contents = File.read(path)
  match = contents.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  raise "missing or malformed YAML frontmatter" unless match

  YAML.safe_load(match[1], permitted_classes: [], aliases: false)
end

def unknown_keys(value, allowed)
  value.keys.map(&:to_s) - allowed
end

plugin = JSON.parse(File.read(File.join(ROOT, ".claude-plugin", "plugin.json")))
plugin_skills = plugin.fetch("skills").map { |path| path.delete_prefix("./") }.sort
top_readme = File.read(File.join(ROOT, "README.md"))

SKILL_FILES.each do |skill_file|
  skill_dir = File.dirname(skill_file)
  relative_dir = skill_dir.delete_prefix("#{ROOT}/")
  bucket = relative_dir.split("/")[1]
  folder_name = File.basename(skill_dir)

  begin
    frontmatter = load_frontmatter(skill_file)
  rescue StandardError => error
    errors << "#{relative_dir}: #{error.message}"
    next
  end

  unless frontmatter.is_a?(Hash)
    errors << "#{relative_dir}: frontmatter must be a mapping"
    next
  end

  extra_frontmatter = unknown_keys(frontmatter, ALLOWED_FRONTMATTER)
  unless extra_frontmatter.empty?
    errors << "#{relative_dir}: unsupported SKILL.md keys: #{extra_frontmatter.sort.join(', ')}"
  end

  name = frontmatter["name"]
  description = frontmatter["description"]
  errors << "#{relative_dir}: name must match folder #{folder_name.inspect}" unless name == folder_name
  unless name.is_a?(String) && name.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && name.length <= 64
    errors << "#{relative_dir}: name must be hyphen-case and at most 64 characters"
  end
  unless description.is_a?(String) && !description.strip.empty? && description.length <= 1024
    errors << "#{relative_dir}: description must be non-empty and at most 1024 characters"
  end
  if description.is_a?(String) && description.match?(/[<>]/)
    errors << "#{relative_dir}: description cannot contain angle brackets"
  end

  argument_hint = frontmatter["argument-hint"]
  if frontmatter.key?("argument-hint") && !(argument_hint.is_a?(String) && !argument_hint.strip.empty?)
    errors << "#{relative_dir}: argument-hint must be a non-empty string"
  end

  disable_model_invocation = frontmatter["disable-model-invocation"]
  unless [nil, true, false].include?(disable_model_invocation)
    errors << "#{relative_dir}: disable-model-invocation must be boolean"
  end

  agent_path = File.join(skill_dir, "agents", "openai.yaml")
  unless File.file?(agent_path)
    errors << "#{relative_dir}: missing agents/openai.yaml"
    next
  end

  begin
    agent = YAML.safe_load(File.read(agent_path), permitted_classes: [], aliases: false)
  rescue StandardError => error
    errors << "#{relative_dir}: invalid agents/openai.yaml: #{error.message}"
    next
  end

  unless agent.is_a?(Hash)
    errors << "#{relative_dir}: agents/openai.yaml must be a mapping"
    next
  end

  extra_agent_keys = unknown_keys(agent, ALLOWED_AGENT_KEYS)
  unless extra_agent_keys.empty?
    errors << "#{relative_dir}: unsupported agents/openai.yaml keys: #{extra_agent_keys.sort.join(', ')}"
  end

  interface = agent["interface"]
  unless interface.is_a?(Hash)
    errors << "#{relative_dir}: interface must be a mapping"
    next
  end

  extra_interface_keys = unknown_keys(interface, ALLOWED_INTERFACE_KEYS)
  unless extra_interface_keys.empty?
    errors << "#{relative_dir}: unsupported interface keys: #{extra_interface_keys.sort.join(', ')}"
  end

  display_name = interface["display_name"]
  short_description = interface["short_description"]
  default_prompt = interface["default_prompt"]
  unless display_name.is_a?(String) && !display_name.strip.empty?
    errors << "#{relative_dir}: interface.display_name must be non-empty"
  end
  unless short_description.is_a?(String) && (25..64).cover?(short_description.length)
    errors << "#{relative_dir}: interface.short_description must be 25-64 characters"
  end
  unless default_prompt.is_a?(String) && default_prompt.include?("$#{name}")
    errors << "#{relative_dir}: interface.default_prompt must mention $#{name}"
  end

  policy = agent["policy"]
  allow_implicit_invocation = nil
  if policy
    unless policy.is_a?(Hash)
      errors << "#{relative_dir}: policy must be a mapping"
    else
      allow_implicit_invocation = policy["allow_implicit_invocation"]
    end
    if policy.is_a?(Hash) && !unknown_keys(policy, ["allow_implicit_invocation"]).empty?
      errors << "#{relative_dir}: policy may only contain allow_implicit_invocation"
    end
    if policy.is_a?(Hash) && ![true, false].include?(allow_implicit_invocation)
      errors << "#{relative_dir}: policy.allow_implicit_invocation must be boolean"
    end
  end

  if disable_model_invocation == true
    user_invoked_count += 1
    unless allow_implicit_invocation == false
      errors << "#{relative_dir}: Claude user-only skill must set Codex allow_implicit_invocation to false"
    end
  elsif allow_implicit_invocation == false
    errors << "#{relative_dir}: Codex user-only skill must set Claude disable-model-invocation to true"
  end

  promoted = PROMOTED_BUCKETS.include?(bucket)
  plugin_entry = relative_dir
  readme_link = "(./#{relative_dir}/SKILL.md)"
  bucket_readme = File.read(File.join(ROOT, "skills", bucket, "README.md"))
  docs_path = File.join(ROOT, "docs", bucket, "#{name}.md")

  if promoted
    errors << "#{relative_dir}: missing from .claude-plugin/plugin.json" unless plugin_skills.include?(plugin_entry)
    errors << "#{relative_dir}: missing from top-level README.md" unless top_readme.include?(readme_link)
    errors << "#{relative_dir}: missing from bucket README.md" unless bucket_readme.include?("(./#{name}/SKILL.md)")
    errors << "#{relative_dir}: missing promoted docs page" unless File.file?(docs_path)
  else
    errors << "#{relative_dir}: non-promoted skill appears in plugin" if plugin_skills.include?(plugin_entry)
    errors << "#{relative_dir}: non-promoted skill appears in top-level README.md" if top_readme.include?(readme_link)
  end
end

expected_promoted = SKILL_FILES.filter_map do |path|
  relative_dir = File.dirname(path).delete_prefix("#{ROOT}/")
  relative_dir if PROMOTED_BUCKETS.include?(relative_dir.split("/")[1])
end.sort

extra_plugin_entries = plugin_skills - expected_promoted
errors << ".claude-plugin/plugin.json: unknown skill entries: #{extra_plugin_entries.join(', ')}" unless extra_plugin_entries.empty?

if errors.empty?
  puts "Validated #{SKILL_FILES.length} skills, #{user_invoked_count} dual-harness user-only policies, and #{expected_promoted.length} promoted entries."
else
  warn "Skill validation failed with #{errors.length} error(s):"
  errors.each { |error| warn "- #{error}" }
  exit 1
end
