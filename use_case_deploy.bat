rem Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.

set DIR_PATH=%CD:\=/%
set WORKSPACE_FILE_URI=file:///%DIR_PATH%/examples/open_bilrost_test_project

cd examples

echo "Dave initializes a submodule of a bilrost project, its relative path mirrors the one informed to deployment file"

call git submodule add --force -b production_repo git@github.com:fl4re/open_bilrost_test_project.git

echo "Dave deploys assets from workspace with 'copy' option"
call bilrost-deploy install --copy -B

echo "Dave removes deployed files"

rm -rf example_workspace
rm -rf example_project
echo %WORKSPACE_FILE_URI%
call bilrost delete-workspace %WORKSPACE_FILE_URI%

cd ..
