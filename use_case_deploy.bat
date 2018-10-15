rem Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.

cd examples

echo "Dave initializes a submodule of a bilrost project, its relative path mirrors the one informed to deployment file"

call git submodule add --force -b production_repo git@github.com:fl4re/open_bilrost_test_project.git

echo "Dave deploys assets from workspace with 'copy' option"
call bilrost-deploy install --copy -B

echo "Dave cleans deployed files"
call bilrost-deploy clean

call bilrost delete-workspace open_bilrost_test_project

cd ..
