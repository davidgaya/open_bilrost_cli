# Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.

DIR_PATH=$(pwd)

DEF_PATH="$DIR_PATH/def.json"
WORKSPACE_PATH="$DIR_PATH/use_case_s3_1_workspace"
RESOURCE_PATH="$WORKSPACE_PATH/alice_resource.txt"

echo $FILE_URL

echo "Alice creates a workspace"
bilrost create-workspace use_case_s3_1_workspace fl4re open_bilrost_test_project production_repo -d "Alice workspace" -B

echo "Alice goes to the new directory"
cd $WORKSPACE_PATH

echo "Alice creates a new branch"
bilrost create-branch new_branch -B

echo "Alice lists branches"
bilrost list-branches -B

echo "Alice changes branch"
bilrost change-branch production_repo -f -B

echo "Alice removes branch"
bilrost remove-branch new_branch -B

echo "Alice saves her first resource"
ls >> $RESOURCE_PATH

echo "Alice creates an asset"
bilrost create-asset new.level -B

echo "Alice renames the new asset"
bilrost rename-asset new.level test.level -B

echo "Alice references the new resource as main dependency to her asset"
bilrost update-asset test.level -m /resources/alice_resource.txt -B

echo "Alice subscribes to this asset"
bilrost subscribe test.level -B

echo "Alice stages this asset"
bilrost stage test.level -B

echo "Alice pushes the stage list"
bilrost push "Test commit" -B

echo "Alice deletes her first resource"
rm $RESOURCE_PATH

echo "Alice deletes the asset"
bilrost delete-asset test.level -B

echo "Alice stages the asset"
bilrost stage test.level -B

echo "Alice commits the stage list"
bilrost push "Undo test commit" -B

echo "Alice goes back to parent folder"
cd $DIR_PATH

echo "Alice removes the workspace"
bilrost delete-workspace use_case_s3_1_workspace -B
