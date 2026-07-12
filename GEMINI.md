# Elite Dashboard: AI Agent Directives

## Architecture State
* **Current Phase:** Frontend Scaffold Complete.
* **Environment:** `elite_dashboard` (Frontend for `elite_quick` ETL).
* **Updates:** Agents MUST rigorously update this section and the Handoff Notes with the current project status at the end of each session.

## Agent Operational Guidelines

### 1. Token Efficiency & Communication
* **Rule 1: Eradicate All Conversational Filler.** Never use pleasantries, greetings, sign-offs, or apologies. Begin every response immediately with the technical answer or action item.
* **Rule 2: Strictly Enforce File-Based Code Edits.** Never output modified code blocks directly into the chat interface. If code needs to be updated, strictly use the `replace_file_content` or `multi_replace_file_content` tools to make the changes directly on the filesystem. Chat output regarding code changes must be limited to a bulleted list of the absolute filepaths modified and a 1-sentence summary of the logical change.
* **Rule 3: Minimal Execution Reporting.** When authorized to execute a task, do not describe what you are about to do before doing it, and do not summarize what you just did in lengthy paragraphs. Inform the user in minimal, bullet point declarative statements strictly displaying the absolute filepaths of files read, written, or commands executed.
* **Rule 4: The Dry-Run Verification Rule.** For complex tasks, always output a numbered list of the exact filepaths you intend to modify and a 1-sentence summary of the change. Halt and wait for user authorization ('Proceed') before utilizing any file-writing tools.
* **Rule 5: Targeted File Reading.** When inspecting large files using `view_file`, avoid reading the entire file at once. Always use `grep_search` first to locate the relevant code, and then restrict `view_file` to a narrow line range. Always output the filepath being inspected.

### 2. Documentation Standards (`docs/`)
* **Diátaxis Framework:** All documentation must adhere to the Diátaxis structure:
    * **Tutorials:** Learning-oriented.
    * **How-to Guides:** Problem-oriented.
    * **Reference:** Information-oriented.
    * **Explanation:** Understanding-oriented.
* **Required Frontmatter:** Every markdown file in the `docs/` directory must include this YAML frontmatter:
    ```yaml
    ---
    title: "Document Title"
    tags: ["tag1", "tag2"]
    created_at: "YYYY-MM-DD"
    last_updated_at: "YYYY-MM-DD"
    ---
    ```
* **Updates:** Agents must update `last_updated_at` when modifying a document.

### 3. Execution & Writing Mandate
* **Approval Override:** When the user explicitly states "approved", "generate the code", or gives clear consent to a proposed design or model, agents are authorized to immediately bypass manual implementation recommendations and write the code directly to the filesystem using the appropriate tools.

## 4. Next Session Context / Handoff Notes
* **Project Status:** Frontend Scaffold complete with Vue 3, Vite, Vue Router, and testing utilities. Base directory structure is set up. Backend CORS has been updated to allow `http://localhost:5173`.
* **Next Immediate Task:** 
  1. Implement basic layout components (`Sidebar`, `Header`).
  2. Integrate the frontend API client with the `fetch()` API.
* **AGY Conversation State:** The current active conversation UUID is `a3e62190-9082-4d92-ae36-ede51fcef8ee`. Use this UUID to restore context if the terminal session is interrupted.
