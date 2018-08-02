rem Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.

set DIR_PATH=%CD%

set DEF_PATH=%DIR_PATH%\def.json
set WORKSPACE_PATH=%DIR_PATH%\use_case_s3_1_workspace
set RESOURCE_PATH=%WORKSPACE_PATH%\alice_resource.txt

echo "Alice creates a workspace"
call bilrost create-workspace use_case_s3_1_workspace %WORKSPACE_PATH% -o fl4re -p open_bilrost_test_project -b production_repo -d "Alice workspace" -B

echo "Alice goes to the new directory"
cd %WORKSPACE_PATH%

echo "Alice creates a new branch"
call bilrost create-branch new_branch -B

echo "Alice lists branches"
call bilrost list-branches -B

echo "Alice changes branch"
call bilrost change-branch production_repo -f -B

echo "Alice removes branch"
call bilrost remove-branch new_branch -B

echo "Alice lists the assets"
call bilrost list-assets /assets/ -B

echo "Alice saves her first resource"
ls > %RESOURCE_PATH%

echo "Alice creates an asset"
call bilrost create-asset /assets/test.level -B

echo "Alice references the new resource as main dependency to her asset"
call bilrost update-asset /assets/test.level -m /resources/alice_resource.txt -B

echo "Alice retrieves the new asset created"
call bilrost list-assets /assets/test.level -B

echo "Alice edits the asset comment"
call bilrost update-asset /assets/test.level -c "Hello" -B

echo "Alice checks the comment has been well edited"
call bilrost list-assets /assets/test.level -B

echo "Alice subscribes to this asset"
call bilrost subscribe ASSET /assets/test.level -B

echo "Alice stages this asset"
call bilrost stage /assets/test.level -B

echo "Alice commits the stage list"
call bilrost commit "Test commit" -B

echo "Alice deletes her first resource"
rm %RESOURCE_PATH%

echo "Alice deletes the asset"
call bilrost delete-asset /assets/test.level -B

echo "Alice stages the asset"
call bilrost stage /assets/test.level -B

echo "Alice commits the stage list"
call bilrost commit "Undo test commit" -B

echo "Alice goes back to parent folder"
cd %DIR_PATH%

echo "Alice removes the workspace"
call bilrost delete-workspace use_case_s3_1_workspace -B
