---
source_url: https://git-scm.com/docs/git-config
captured_at: 2026-03-21
title: Git - git-config Documentation
---

## NAME

git-config - Get and set repository or global options

## SYNOPSIS

```
git config list [<file-option>] [<display-option>] [--includes]
git config get [<file-option>] [<display-option>] [--includes] [--all] [--regexp] [--value=<pattern>] [--fixed-value] [--default=<default>] [--url=<url>] <name>
git config set [<file-option>] [--type=<type>] [--all] [--value=<pattern>] [--fixed-value] <name> <value>
git config unset [<file-option>] [--all] [--value=<pattern>] [--fixed-value] <name>
git config rename-section [<file-option>] <old-name> <new-name>
git config remove-section [<file-option>] <name>
git config edit [<file-option>]
```

## DESCRIPTION

You can query/set/replace/unset options with this command. The name is
actually the section and the key separated by a dot, and the value will be
escaped.

Multiple lines can be added to an option by using the `--append` option.
If you want to update or unset an option which can occur on multiple
lines, `--value=` _<pattern>_ (which is an extended regular expression,
unless the `--fixed-value` option is given) needs to be given. Only the
existing values that match the pattern are updated or unset. If
you want to handle the lines that do **not** match the pattern, just
prepend a single exclamation mark in front (see also [EXAMPLES](https://git-scm.com/docs/git-config#EXAMPLES)),
but note that this only works when the `--fixed-value` option is not
in use.

The `--type=` _<type>_ option instructs _git config_ to ensure that incoming and
outgoing values are canonicalize-able under the given <type>. If no
`--type=` _<type>_ is given, no canonicalization will be performed. Callers may
unset an existing `--type` specifier with `--no-type`.

When reading, the values are read from the system, global and
repository local configuration files by default, and options
`--system`, `--global`, `--local`, `--worktree` and
`--file` _<filename>_ can be used to tell the command to read from only
that location (see [FILES](https://git-scm.com/docs/git-config#FILES)).

When writing, the new value is written to the repository local
configuration file by default, and options `--system`, `--global`,
`--worktree`, `--file` _<filename>_ can be used to tell the command to
write to that location (you can say `--local` but that is the
default).

This command will fail with non-zero status upon error. Some exit
codes are:

- The section or key is invalid (ret=1),
- no section or name was provided (ret=2),
- the config file is invalid (ret=3),
- the config file cannot be written (ret=4),
- you try to unset an option which does not exist (ret=5),
- you try to unset/set an option for which multiple lines match (ret=5), or
- you try to use an invalid regexp (ret=6).

On success, the command returns the exit code 0.

## COMMANDS

list

List all variables set in config file, along with their values.

get

Emits the value of the specified key. If key is present multiple times
in the configuration, emits the last value. If `--all` is specified,
emits all values associated with key. Returns error code 1 if key is
not present.

set

Set value for one or more config options. By default, this command
refuses to write multi-valued config options. Passing `--all` will
replace all multi-valued config options with the new value, whereas
`--value=` will replace all config options whose values match the given
pattern.

unset

Unset value for one or more config options. By default, this command
refuses to unset multi-valued keys. Passing `--all` will unset all
multi-valued config options, whereas `--value` will unset all config
options whose values match the given pattern.

rename-section

Rename the given section to a new name.

remove-section

Remove the given section from the configuration file.

edit

Opens an editor to modify the specified config file; either
`--system`, `--global`, `--local` (default), `--worktree`, or
`--file` _<config-file>_.

## OPTIONS

--replace-all

Default behavior is to replace at most one line. This replaces
all lines matching the key (and optionally `--value=` _<pattern>_).

--append

Adds a new line to the option without altering any existing
values. This is the same as providing _--value=^$_ in `set`.

--all

With `get`, return all values for a multi-valued key.

--regexp

With `get`, interpret the name as a regular expression. Regular
expression matching is currently case-sensitive and done against a
canonicalized version of the key in which section and variable names
are lowercased, but subsection names are not.

--global

For writing options: write to global `~/.gitconfig` file
rather than the repository `.git/config`, write to
`$XDG_CONFIG_HOME/git/config` file if this file exists and the
`~/.gitconfig` file does not.

For reading options: read only from global `~/.gitconfig` and from
`$XDG_CONFIG_HOME/git/config` rather than from all available files.

See also [FILES](https://git-scm.com/docs/git-config#FILES).

--system

For writing options: write to system-wide
`$`(`prefix`)`/etc/gitconfig` rather than the repository
`.git/config`.

For reading options: read only from system-wide `$`(`prefix`)`/etc/gitconfig`
rather than from all available files.

See also [FILES](https://git-scm.com/docs/git-config#FILES).

--local

For writing options: write to the repository `.git/config` file.
This is the default behavior.

For reading options: read only from the repository `.git/config` rather than
from all available files.

See also [FILES](https://git-scm.com/docs/git-config#FILES).

--worktree

Similar to `--local` except that `$GIT_DIR/config.worktree` is
read from or written to if `extensions.worktreeConfig` is
enabled. If not it is the same as `--local`. Note that `$GIT_DIR`
is equal to `$GIT_COMMON_DIR` for the main working tree, but is of
the form `$GIT_DIR/worktrees/` _<id>_`/` for other working trees. See
[git-worktree\[1\]](https://git-scm.com/docs/git-worktree) to learn how to enable
`extensions.worktreeConfig`.

-f <config-file> --file <config-file>

For writing options: write to the specified file rather than the
repository `.git/config`.

For reading options: read only from the specified file rather than from all
available files.

See also [FILES](https://git-scm.com/docs/git-config#FILES).

`--value=` _<pattern>_`--no-value`

With `get`, `set`, and `unset`, match only against
_<pattern>_. The pattern is an extended regular expression unless
`--fixed-value` is given.

Use `--no-value` to unset _<pattern>_.

--fixed-value

When used with `--value=` _<pattern>_, treat _<pattern>_ as
an exact string instead of a regular expression. This will restrict
the name/value pairs that are matched to only those where the value
is exactly equal to _<pattern>_.

--show-origin

Augment the output of all queried config options with the
origin type (file, standard input, blob, command line) and
the actual origin (config file path, ref, or blob id if
applicable).

--show-scope

Similar to `--show-origin` in that it augments the output of
all queried config options with the scope of that value
(worktree, local, global, system, command).

--default <value>

When using `get`, and the requested variable is not found, behave as if
<value> were the value assigned to that variable.

## FILES

By default, _git config_ will read configuration options from multiple
files:

$(prefix)/etc/gitconfig

System-wide configuration file.

$XDG\_CONFIG\_HOME/git/config ~/.gitconfig

User-specific configuration files. When the XDG\_CONFIG\_HOME environment
variable is not set or empty, $HOME/.config/ is used as
$XDG\_CONFIG\_HOME.

These are also called "global" configuration files. If both files exist, both
files are read in the order given above.

$GIT\_DIR/config

Repository specific configuration file.

$GIT\_DIR/config.worktree

This is optional and is only searched when
`extensions.worktreeConfig` is present in $GIT\_DIR/config.

You may also provide additional configuration parameters when running any
git command by using the `-c` option. See [git\[1\]](https://git-scm.com/docs/git) for details.

Options will be read from all of these files that are available. If the
global or the system-wide configuration files are missing or unreadable they
will be ignored. If the repository configuration file is missing or unreadable,
_git config_ will exit with a non-zero error code. An error message is produced
if the file is unreadable, but not if it is missing.

The files are read in the order given above, with last value found taking
precedence over values read earlier. When multiple values are taken then all
values of a key from all files will be used.

By default, options are only written to the repository specific
configuration file. Note that this also affects options like `set`
and `unset`. **_git config_ will only ever change one file at a time**.

You can limit which configuration sources are read from or written to by
specifying the path of a file with the `--file` option, or by specifying a
configuration scope with `--system`, `--global`, `--local`, or `--worktree`.
For more, see [OPTIONS](https://git-scm.com/docs/git-config#OPTIONS) above.

## SCOPES

Each configuration source falls within a configuration scope. The scopes
are:

system

$(prefix)/etc/gitconfig

global

$XDG\_CONFIG\_HOME/git/config

~/.gitconfig

local

$GIT\_DIR/config

worktree

$GIT\_DIR/config.worktree

command

GIT\_CONFIG\_{COUNT,KEY,VALUE} environment variables (see [ENVIRONMENT](https://git-scm.com/docs/git-config#ENVIRONMENT)
below)

the `-c` option

With the exception of _command_, each scope corresponds to a command line
option: `--system`, `--global`, `--local`, `--worktree`.

When reading options, specifying a scope will only read options from the
files within that scope. When writing options, specifying a scope will write
to the files within that scope (instead of the repository specific
configuration file). See [OPTIONS](https://git-scm.com/docs/git-config#OPTIONS) above for a complete description.

Most configuration options are respected regardless of the scope it is
defined in, but some options are only respected in certain scopes. See the
respective option's documentation for the full details.

## EXAMPLES

Given a .git/config like this:

```
#
# This is the config file, and
# a '#' or ';' character indicates
# a comment
#

; core variables
[core]
	; Don't trust file modes
	filemode = false

; Our diff algorithm
[diff]
	external = /usr/local/bin/diff-wrapper
	renames = true

; Proxy settings
[core]
	gitproxy=proxy-command for kernel.org
	gitproxy=default-proxy ; for all the rest

; HTTP
[http]
	sslVerify
[http "https://weak.example.com"]
	sslVerify = false
	cookieFile = /tmp/cookie.txt
```

you can set the filemode to true with

```
% git config set core.filemode true
```

The hypothetical proxy command entries actually have a postfix to discern
what URL they apply to. Here is how to change the entry for kernel.org
to "ssh".

```
% git config set --value='for kernel.org$' core.gitproxy '"ssh" for kernel.org'
```

This makes sure that only the key/value pair for kernel.org is replaced.

To delete the entry for renames, do

```
% git config unset diff.renames
```

If you want to delete an entry for a multivar (like core.gitproxy above),
you have to provide a regex matching the value of exactly one line.

To query the value for a given key, do

```
% git config get core.filemode
```

or, to query a multivar:

```
% git config get --value="for kernel.org$" core.gitproxy
```

If you want to know all the values for a multivar, do:

```
% git config get --all --show-names core.gitproxy
```

If you like to live dangerously, you can replace **all** core.gitproxy by a
new one with

```
% git config set --all core.gitproxy ssh
```

However, if you really only want to replace the line for the default proxy,
i.e. the one without a "for …​" postfix, do something like this:

```
% git config set --value='! for ' core.gitproxy ssh
```

To actually match only values with an exclamation mark, you have to

```
% git config set --value='[!]' section.key value
```

To add a new proxy, without altering any of the existing ones, use

```
% git config set --append core.gitproxy '"proxy-command" for example.com'
```

## CONFIGURATION FILE

The Git configuration file contains a number of variables that affect
the Git commands' behavior. The files `.git/config` and optionally
`config.worktree` (see the "CONFIGURATION FILE" section of
[git-worktree\[1\]](https://git-scm.com/docs/git-worktree)) in each repository are used to store the
configuration for that repository, and `$HOME/.gitconfig` is used to
store a per-user configuration as fallback values for the `.git/config`
file. The file `/etc/gitconfig` can be used to store a system-wide
default configuration.

The configuration variables are used by both the Git plumbing
and the porcelain commands. The variables are divided into sections, wherein
the fully qualified variable name of the variable itself is the last
dot-separated segment and the section name is everything before the last
dot. The variable names are case-insensitive, allow only alphanumeric
characters and `-`, and must start with an alphabetic character. Some
variables may appear multiple times; we say then that the variable is
multivalued.

### Syntax

The syntax is fairly flexible and permissive. Whitespace characters,
which in this context are the space character (SP) and the horizontal
tabulation (HT), are mostly ignored. The _#_ and _;_ characters begin
comments to the end of line. Blank lines are ignored.

The file consists of sections and variables. A section begins with
the name of the section in square brackets and continues until the next
section begins. Section names are case-insensitive. Only alphanumeric
characters, `-` and `.` are allowed in section names. Each variable
must belong to some section, which means that there must be a section
header before the first setting of a variable.

Sections can be further divided into subsections. To begin a subsection
put its name in double quotes, separated by space from the section name,
in the section header, like in the example below:

```
	[section "subsection"]
```

Subsection names are case sensitive and can contain any characters except
newline and the null byte. Doublequote `"` and backslash can be included
by escaping them as _\\"_ and _\\\_, respectively. Backslashes preceding
other characters are dropped when reading; for example, _\\t_ is read as
`t` and _\\0_ is read as `0`. Section headers cannot span multiple lines.
Variables may belong directly to a section or to a given subsection. You
can have \[`section`\] if you have \[`section``"subsection"`\], but you do not
need to.

There is also a deprecated \[`section.subsection`\] syntax. With this
syntax, the subsection name is converted to lower-case and is also
compared case sensitively. These subsection names follow the same
restrictions as section names.

All the other lines (and the remainder of the line after the section
header) are recognized as setting variables, in the form
_name = value_ (or just _name_, which is a short-hand to say that
the variable is the boolean "true").
The variable names are case-insensitive, allow only alphanumeric characters
and `-`, and must start with an alphabetic character.

Whitespace characters surrounding `name`, `=` and `value` are discarded.
Internal whitespace characters within _value_ are retained verbatim.
Comments starting with either `#` or _;_ and extending to the end of line
are discarded. A line that defines a value can be continued to the next
line by ending it with a backslash (_\_); the backslash and the end-of-line
characters are discarded.

If `value` needs to contain leading or trailing whitespace characters,
it must be enclosed in double quotation marks (`"`). Inside double quotation
marks, double quote (`"`) and backslash (_\_) characters must be escaped:
use _\\"_ for `"` and _\\\_ for _\_.

The following escape sequences (beside _\\"_ and _\\\_) are recognized:
_\\n_ for newline character (NL), _\\t_ for horizontal tabulation (HT, TAB)
and _\\b_ for backspace (BS). Other char escape sequences (including octal
escape sequences) are invalid.

### Includes

The `include` and `includeIf` sections allow you to include config
directives from another source. These sections behave identically to
each other with the exception that `includeIf` sections may be ignored
if their condition does not evaluate to true; see "Conditional includes"
below.

You can include a config file from another by setting the special
`include.path` (or `includeIf.*.path`) variable to the name of the file
to be included. The variable takes a pathname as its value, and is
subject to tilde expansion. These variables can be given multiple times.

The contents of the included file are inserted immediately, as if they
had been found at the location of the include directive. If the value of the
variable is a relative path, the path is considered to
be relative to the configuration file in which the include directive
was found. See below for examples.

### Conditional includes

You can conditionally include a config file from another by setting an
`includeIf.` _<condition>_`.path` variable to the name of the file to be
included.

The condition starts with a keyword followed by a colon and some data
whose format and meaning depends on the keyword. Supported keywords
are:

`gitdir`

The data that follows the keyword `gitdir` and a colon is used as a glob
pattern. If the location of the .git directory matches the
pattern, the include condition is met.

The .git location may be auto-discovered, or come from `$GIT_DIR`
environment variable. If the repository is auto-discovered via a .git
file (e.g. from submodules, or a linked worktree), the .git location
would be the final location where the .git directory is, not where the
.git file is.

The pattern can contain standard globbing wildcards and two additional
ones, `**/` and `/**`, that can match multiple path components. Please
refer to [gitignore\[5\]](https://git-scm.com/docs/gitignore) for details. For convenience:

- If the pattern starts with `~/`, `~` will be substituted with the
content of the environment variable `HOME`.

- If the pattern starts with `./`, it is replaced with the directory
containing the current config file.

- If the pattern does not start with either `~/`, `./` or `/`, `**/`
will be automatically prepended. For example, the pattern `foo/bar`
becomes `**/foo/bar` and would match `/any/path/to/foo/bar`.

- If the pattern ends with `/`, `**` will be automatically added. For
example, the pattern `foo/` becomes `foo/**`. In other words, it
matches "foo" and everything inside, recursively.

`gitdir/i`

This is the same as `gitdir` except that matching is done
case-insensitively (e.g. on case-insensitive file systems)

`onbranch`

The data that follows the keyword `onbranch` and a colon is taken to be a
pattern with standard globbing wildcards and two additional
ones, `**/` and `/**`, that can match multiple path components.
If we are in a worktree where the name of the branch that is
currently checked out matches the pattern, the include condition
is met.

If the pattern ends with `/`, `**` will be automatically added. For
example, the pattern `foo/` becomes `foo/**`. In other words, it matches
all branches that begin with `foo/`. This is useful if your branches are
organized hierarchically and you would like to apply a configuration to
all the branches in that hierarchy.

`hasconfig:remote.*.url`

The data that follows this keyword and a colon is taken to
be a pattern with standard globbing wildcards and two
additional ones, `**/` and `/**`, that can match multiple
components. The first time this keyword is seen, the rest of
the config files will be scanned for remote URLs (without
applying any values). If there exists at least one remote URL
that matches this pattern, the include condition is met.

Files included by this option (directly or indirectly) are not allowed
to contain remote URLs.

Note that unlike other includeIf conditions, resolving this condition
relies on information that is not yet known at the point of reading the
condition. A typical use case is this option being present as a
system-level or global-level config, and the remote URL being in a
local-level config; hence the need to scan ahead when resolving this
condition. In order to avoid the chicken-and-egg problem in which
potentially-included files can affect whether such files are potentially
included, Git breaks the cycle by prohibiting these files from affecting
the resolution of these conditions (thus, prohibiting them from
declaring remote URLs).

As for the naming of this keyword, it is for forwards compatibility with
a naming scheme that supports more variable-based include conditions,
but currently Git only supports the exact keyword described above.

A few more notes on matching via `gitdir` and `gitdir/i`:

- Symlinks in `$GIT_DIR` are not resolved before matching.

- Both the symlink & realpath versions of paths will be matched
outside of `$GIT_DIR`. E.g. if ~/git is a symlink to
/mnt/storage/git, both `gitdir:~/git` and `gitdir:/mnt/storage/git`
will match.

This was not the case in the initial release of this feature in
v2.13.0, which only matched the realpath version. Configuration that
wants to be compatible with the initial release of this feature needs to
either specify only the realpath version, or both versions.

- Note that "../" is not special and will match literally, which is
unlikely what you want.

### Example

```
# Core variables
[core]
	; Don't trust file modes
	filemode = false

# Our diff algorithm
[diff]
	external = /usr/local/bin/diff-wrapper
	renames = true

[branch "devel"]
	remote = origin
	merge = refs/heads/devel

# Proxy settings
[core]
	gitProxy="ssh" for "kernel.org"
	gitProxy=default-proxy ; for the rest

[include]
	path = /path/to/foo.inc ; include by absolute path
	path = foo.inc ; find "foo.inc" relative to the current file
	path = ~/foo.inc ; find "foo.inc" in your `$HOME` directory

; include if $GIT_DIR is /path/to/foo/.git
[includeIf "gitdir:/path/to/foo/.git"]
	path = /path/to/foo.inc

; include for all repositories inside /path/to/group
[includeIf "gitdir:/path/to/group/"]
	path = /path/to/foo.inc

; include for all repositories inside $HOME/to/group
[includeIf "gitdir:~/to/group/"]
	path = /path/to/foo.inc

; relative paths are always relative to the including
; file (if the condition is true); their location is not
; affected by the condition
[includeIf "gitdir:/path/to/group/"]
	path = foo.inc

; include only if we are in a worktree where foo-branch is
; currently checked out
[includeIf "onbranch:foo-branch"]
	path = foo.inc

; include only if a remote with the given URL exists (note
; that such a URL may be provided later in a file or in a
; file read after this file is read, as seen in this example)
[includeIf "hasconfig:remote.*.url:https://example.com/**"]
	path = foo.inc
[remote "origin"]
	url = https://example.com/git
```

## VARIABLES

This list covers variables most relevant to submodule and worktree
configuration. For the complete variable list, see the online man page.

submodule.<name>.url

The URL for a submodule. This variable is copied from the .gitmodules
file to the git config via _git submodule init_. The user can change
the configured URL before obtaining the submodule via _git submodule_
_update_. If neither submodule.<name>.active nor submodule.active are
set, the presence of this variable is used as a fallback to indicate
whether the submodule is of interest to git commands.
See [git-submodule\[1\]](https://git-scm.com/docs/git-submodule) and [gitmodules\[5\]](https://git-scm.com/docs/gitmodules) for details.

submodule.<name>.update

The method by which a submodule is updated by _git submodule update_,
which is the only affected command, others such as
_git checkout --recurse-submodules_ are unaffected. It exists for
historical reasons, when _git submodule_ was the only command to
interact with submodules; settings like `submodule.active`
and `pull.rebase` are more specific. It is populated by
`git submodule init` from the [gitmodules\[5\]](https://git-scm.com/docs/gitmodules) file.
See description of _update_ command in [git-submodule\[1\]](https://git-scm.com/docs/git-submodule).

submodule.<name>.branch

The remote branch name for a submodule, used by `git submodule update --remote`. Set this option to override the value found in
the `.gitmodules` file. See [git-submodule\[1\]](https://git-scm.com/docs/git-submodule) and
[gitmodules\[5\]](https://git-scm.com/docs/gitmodules) for details.

submodule.<name>.fetchRecurseSubmodules

This option can be used to control recursive fetching of this
submodule. It can be overridden by using the --\[no-\]recurse-submodules
command-line option to "git fetch" and "git pull".
This setting will override that from in the [gitmodules\[5\]](https://git-scm.com/docs/gitmodules)
file.

submodule.<name>.ignore

Defines under what circumstances "git status" and the diff family show
a submodule as modified. When set to "all", it will never be considered
modified (but it will nonetheless show up in the output of status and
commit when it has been staged), "dirty" will ignore all changes
to the submodule's work tree and
takes only differences between the HEAD of the submodule and the commit
recorded in the superproject into account. "untracked" will additionally
let submodules with modified tracked files in their work tree show up.
Using "none" (the default when this option is not set) also shows
submodules that have untracked files in their work tree as changed.
This setting overrides any setting made in .gitmodules for this submodule,
both settings can be overridden on the command line by using the
"--ignore-submodules" option. The _git submodule_ commands are not
affected by this setting.

submodule.<name>.active

Boolean value indicating if the submodule is of interest to git
commands. This config option takes precedence over the
submodule.active config option. See [gitsubmodules\[7\]](https://git-scm.com/docs/gitsubmodules) for
details.

submodule.active

A repeated field which contains a pathspec used to match against a
submodule's path to determine if the submodule is of interest to git
commands. See [gitsubmodules\[7\]](https://git-scm.com/docs/gitsubmodules) for details.

submodule.recurse

A boolean indicating if commands should enable the `--recurse-submodules`
option by default. Defaults to false.

When set to true, it can be deactivated via the
`--no-recurse-submodules` option. Note that some Git commands
lacking this option may call some of the above commands affected by
`submodule.recurse`; for instance `git remote update` will call
`git fetch` but does not have a `--no-recurse-submodules` option.
For these commands a workaround is to temporarily change the
configuration value by using `git -c submodule.recurse=0`.

The following list shows the commands that accept
`--recurse-submodules` and whether they are supported by this
setting.

- `checkout`, `fetch`, `grep`, `pull`, `push`, `read-tree`,
`reset`, `restore` and `switch` are always supported.

- `clone` and `ls-files` are not supported.

- `branch` is supported only if `submodule.propagateBranches` is
enabled

submodule.propagateBranches

\[EXPERIMENTAL\] A boolean that enables branching support when
using `--recurse-submodules` or `submodule.recurse=true`.
Enabling this will allow certain commands to accept
`--recurse-submodules` and certain commands that already accept
`--recurse-submodules` will now consider branches.
Defaults to false.

submodule.fetchJobs

Specifies how many submodules are fetched/cloned at the same time.
A positive integer allows up to that number of submodules fetched
in parallel. A value of 0 will give some reasonable default.
If unset, it defaults to 1.

submodule.alternateLocation

Specifies how the submodules obtain alternates when submodules are
cloned. Possible values are `no`, `superproject`.
By default `no` is assumed, which does not add references. When the
value is set to `superproject` the submodule to be cloned computes
its alternates location relative to the superprojects alternate.

submodule.alternateErrorStrategy

Specifies how to treat errors with the alternates for a submodule
as computed via `submodule.alternateLocation`. Possible values are
`ignore`, `info`, `die`. Default is `die`. Note that if set to `ignore`
or `info`, and if there is an error with the computed alternate, the
clone proceeds as if no alternate was specified.

extensions.worktreeConfig

If enabled, then worktrees will load config settings from the
`$GIT_DIR/config.worktree` file in addition to the
`$GIT_COMMON_DIR/config` file. Note that `$GIT_COMMON_DIR` and
`$GIT_DIR` are the same for the main working tree, while other
working trees have `$GIT_DIR` equal to
`$GIT_COMMON_DIR/worktrees/` _<id>_`/`. The settings in the
`config.worktree` file will override settings from any other
config files.

When enabling this extension, you must be careful to move
certain values from the common config file to the main working tree's
`config.worktree` file, if present:

- `core.worktree` must be moved from `$GIT_COMMON_DIR/config` to
`$GIT_COMMON_DIR/config.worktree`.

- If `core.bare` is true, then it must be moved from `$GIT_COMMON_DIR/config`
to `$GIT_COMMON_DIR/config.worktree`.

It may also be beneficial to adjust the locations of `core.sparseCheckout`
and `core.sparseCheckoutCone` depending on your desire for customizable
sparse-checkout settings for each worktree. By default, the `git sparse-checkout` builtin enables this extension, assigns
these config values on a per-worktree basis, and uses the
`$GIT_DIR/info/sparse-checkout` file to specify the sparsity for each
worktree independently. See [git-sparse-checkout\[1\]](https://git-scm.com/docs/git-sparse-checkout) for more
details.

For historical reasons, this extension is respected regardless of the
`core.repositoryFormatVersion` setting.
