# Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.

cd examples

DIR_PATH=$(pwd)
WORKSPACE_PATH="file://$DIR_PATH/examples/open_bilrost_test_project"

echo "Dave initializes a submodule of a bilrost project, its relative path mirrors the one informed to deployment file"

git submodule add --force -b production_repo git@github.com:fl4re/open_bilrost_test_project.git

echo "Dave deploys assets from workspace with 'copy' option"
bilrost-deploy install --copy -B

echo "Dave removes deployed files"

bilrost-deploy clean
bilrost delete-workspace open_bilrost_test_project

cd ..
