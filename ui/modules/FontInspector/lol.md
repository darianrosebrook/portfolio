
# Guide to Setting Up the Figma MCP Server in Cursor

## Step 1: Enable the Desktop MCP Server in Figma
1. Open Figma.
2. Press `Cmd + /` to open the command menu.
3. Search for "MCP" and click on "Enable desktop MCP server".

## Step 2: Connect to Cursor
1. After enabling the MCP server, a modal will appear with provider options.
2. Select "Cursor" and click the "+ Add" button.
3. Cursor should open (ensure it is already installed).
4. Click the "Install" button when prompted in Cursor.

## Step 3: Initialize a Local Git Repository
1. Open the terminal in Cursor.
2. Navigate to your desired directory.
3. Run the following commands to set up a local Git repository and connect to the FigmaMCP server:
   ```bash
   git init
   echo "# FigmaMCP Integration" >> README.md
   git add README.md
   git commit -m "Initial commit"
   ```

## Step 4: Connect to the Figma File
1. Pull the contents of the Figma file using the provided link: [link placeholder].
   ```bash
   # Example command to pull Figma contents
   # Ensure you replace with actual commands or use tools/scripts as needed
   ```
2. Update the README with the Figma link, starting commands, and server setup instructions.

## Documentation Update
- **Figma Link:** [link placeholder]
- **Starting Commands:**
  - `Cmd + /` in Figma and search for "MCP"
  - Click "Enable desktop MCP server"
- **Server Setup Instructions:**
  - Connect to "Cursor" and follow the prompts to install.
  - Initialize a Git repository and commit the initial setup.

Ensure that the repository is initialized properly and document the process for future reference in the README file.

