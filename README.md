# Asset manager

Bilrost comes with a command line tool to interact with the version control system features. Use `bilrost --help` prefix to get command lists. `bilrost [command_name] --help` gives details about specific command execution.

## Commands
```
    whoami                                                 Retrieve user information if connected
    login                                                  Authenticate user
    session <id>                                           Set session id to use to communicate with bilrost back end
    logout                                                 Log out user

    list-workspace [options]                               List workspaces available in the favorite list
    add-workspace <file_uri>                               Add workspace to the favorite list
    forget-workspace <file_uri>                            Forget a project
    create-workspace [options] <workspace_name> <fil_uri>  Create a workspace
    delete-workspace <identifier>                          Delete a workspace

    list-asset [options] <reference>                       List assets
    create-asset [options] <reference>                     Create an asset
    rename-asset [options] <reference> <new_name>          Rename an asset
    update-asset [options] <reference>                     Update an asset
    delete-asset [options] <reference>                     Delete an asset
    deploy-asset [options] <definition_relative_path>      Deploy assets

    subscriptions [options]                                Print subscription list
    subscribe [options] <type> <descriptor>                Subscribe to an asset, namespace or search
    unsubscribe [options] <subscription_id>                Unsubscribe specific subscription

    stage-list [options]                                   Print stage list
    stage [options] <reference>                            Stage asset or resource
    unstage [options] <reference>                          Unstage asset or resource

    status [options]                                       Print workspace, resource or asset statuses
    commit [options] <comment>                             Commit staged items
    commit-folder-asset [options] <reference>              Commit a folder asset. This is a fast way to version a directory

    list-branch [options]                                  List available branches
    get-branch [options]                                   Get current branch
    create-branch [options] <branch_name>                  Create a branch from current one
    change-branch [options] <branch_name>                  Change branch
    remove-branch [options] <branch_name>                  Remove branch
```

## Update asset walkthrough

1/ Create workspace.

A workspace is the local representation of a project. This is where assets are updated.

`bilrost create-workspace test-workspace relative/path/to/folder --organization org_name --project-name test --branch master --description "test workspace"`

2/ Create branch.

Branches allows work isolation. Every update must happen within a new branch in order to avoid conflicts.

`bilrost create-branch new_branch`

3/ Subscribe

Subscription pulls given asset content to workspace.

`bilrost subscribe ASSET /assets/test_asset`

4/ Update an asset.

Define new asset properties.

`bilrost update-asset /assets/test_asset --add /resources/test_asset/tools --delete /resources/test_asset/detail`

5/ Stage the modification

Adds the subscribed asset to the stage list. 

`bilrost stage /assets/test_asset`

6/ Commit

Pushes the staged assets to remote server.

`bilrost commit "Updated /assets/test_asset"`

7/ Create Pull Request

Go to project github webpage and create a pull request from the commited branch. Ask for a colleague to review and merge your updated assets!
