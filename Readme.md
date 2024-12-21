For running the code, cd the specific directory you want to run, then npm install, and npm run dev.

For creating pull request, do this process.

- git add . # Add all changes (or specify files)
- git commit -m "Your commit message"
- git push origin feature-branch (Push first in the branch that you are working in.)
- gh pr create --base main --head feature-branch --title "My PR" --body "Description of changes"
