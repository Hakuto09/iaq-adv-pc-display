#!/bin/bash

set -x

#!/bin/bash

# İ’è: ƒŠƒXƒg‚ğ’è‹`
branch_list=( \
"main" \
"feature" \
"test" \
"testf" \
"testaafebe" \
"testcc" \
"iaqdev" \
"meeqdev" \
)

if [ $# -ne 3 ];then
	echo "sh <branch> <version> <commit comment>"
	echo "Example: sh feature V1.0.0 20250311r01-001_build-test"
	echo "branch list:"
	for item in "${branch_list[@]}"; do
		echo "$item"
	done
	exit 1
fi

branch=$1
version=$2
comments=$3
found=false

rm -f src/userbranch.js
rm -f src/version.js

for item in "${branch_list[@]}"; do
  if [ "$item" == "$branch" ]; then
    found=true
    break
  fi
done

if [ $found == true ]; then
	echo "export const userBranch = '$branch';" > src/userbranch.js
else
	echo "'$BRANCH' is not exist as userBranch!!"
	exit
fi

echo "export const version = '$version';" > src/version.js

git add .
git commit -m "$comments"
git push origin "$branch"


echo "export const userBranch = 'DUMMY';" > src/userbranch.js
echo "export const version = 'DUMMY';" > src/version.js

