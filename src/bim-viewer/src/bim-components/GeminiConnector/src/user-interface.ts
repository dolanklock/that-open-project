/* eslint-disable no-alert */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
// Import That Open Library
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import { GeminiConnector } from "..";

export const geminiConnectorUI = (components: OBC.Components) => {
  const textInput = document.createElement("bim-text-input");
  textInput.placeholder = "Write your prompt here...";

  const dropdown = document.createElement("bim-dropdown") as BUI.Dropdown
  const geminiOpt = document.createElement("bim-option");
  geminiOpt.label = `Gemini 1.5 Flash`;
  geminiOpt.value = 'gemini-1.5-flash';
  const testOpt = document.createElement("bim-option");
  testOpt.label = `Gemini 1.5 Pro`;
  testOpt.value = 'gemini-1.5-pro';
  dropdown.append(geminiOpt, testOpt);
  dropdown.addEventListener("change", () => {
    const value = dropdown.value as string[];
    alert(`You've selected: ${value.join(", ")}.`);
    geminiConnector.modelName = value[0]
    geminiConnector.updateModal()
  });

  const geminiConnector = components.get(GeminiConnector)

  const onGenerateClick = async () => {
    if (textInput.value.trim() === "") return;
    const highlighter = components.get(OBF.Highlighter);
    // Retrieve the selection from the highlighter
    const selection = highlighter.selection.select;
    // Send our data to the ask method.
    const fragmentIdMap = await geminiConnector.ask(textInput.value, selection);
    // Use the highlighter back again to 
    highlighter.highlightByID("select", fragmentIdMap);
  }

  const panelSection = BUI.Component.create(() => {
    return BUI.html`
    <bim-panel-section label="Ask Gemini" icon="hugeicons:artificial-intelligence-06">
      <div style="display: flex; align-items: center;">
        <div style="flex-grow: 1;">
	        <bim-label>Gemini 1.5 Flash</bim-label>
        </div>
      <bim-button @click=${onGenerateClick} label="Generate" icon="iconoir:sparks-solid" style="flex-shrink: 0; margin-left: 0.5rem;">
      </bim-button>
      </div>
      <div>
        ${textInput}
      </div>
      <bim-label>Select a Model</bim-label>
      <div>
        ${dropdown}
      </div>
    </bim-panel-section>
    `;
  });

  return panelSection;
};
