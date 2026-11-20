# Triage labels

| Role            | Label             | Meaning                                        |
| --------------- | ----------------- | ---------------------------------------------- |
| needs-triage    | `needs-triage`    | The maintainer needs to evaluate this issue    |
| needs-info      | `needs-info`      | Waiting on the reporter for more information   |
| ready-for-agent | `ready-for-agent` | Fully specified, ready for an unattended agent |
| ready-for-human | `ready-for-human` | Requires a person                              |
| wontfix         | `wontfix`         | Will not be actioned                           |

## Other labels

| Label                                                    | Meaning                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `task`                                                   | An issue written as a spec (see `issue-tracker.md`).                                 |
| `bug`, `enhancement`                                     | Type labels from the Bug and Feature forms.                                          |
| `game:zerod`, `game:pebo`, `game:ogro-party`, `game:hub` | Which game, or the hub itself, the issue is about. `game:hub` covers a new game too. |

A triaged issue has exactly one of `ready-for-agent`, `ready-for-human`, `needs-info`, `wontfix`, plus one `game:` label. `needs-triage` is removed when that happens.
