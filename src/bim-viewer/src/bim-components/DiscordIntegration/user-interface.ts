/* eslint-disable dot-notation */
/* eslint-disable no-use-before-define */
/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import { DiscordIntegration } from "."

// step 1. figure out how to get all text channels in users channel

// have "send message using"... then list image logo of discord, teams, etc. if user clicks
// discord have discord verification pop up for user to login. have the user select from a dropdown what channel
// to send to.

export const DiscordIntegrationUI = (components: OBC.Components, world: OBC.World) => {
  const webhooks = {
    ModelClashes: "https://discord.com/api/webhooks/1255323007778295829/sB4zvu4GmHHRqLDM85GYUvy6_VSR_H5GFGAl613ueoVpm8iKozz8o-sr6JkNP_WhgcAZ",
    DesignUpdates: "https://discord.com/api/webhooks/1255312794363105440/UmH_HyzgBiAFAxAUbfDTYRcaswZODaJkwdTIVnVxhtpAUS8LK6nJulmE5Xx25DAD_Mj9"
  }

  const textInput = document.createElement("bim-text-input") as BUI.TextInput
  const discordIntegration = components.get(DiscordIntegration)
  discordIntegration.config.webhookURL = Object.values(webhooks)[0]

  const sendMessage = () => {
    if (textInput.value.trim() === "") {
      alert("Enter a message")
    } else {
      discordIntegration.sendMessage(world, textInput.value)
      textInput.value = ""
      modal.close()
    }
  }

  const dropdown = new BUI.Dropdown() as BUI.Dropdown
  for (const key in webhooks ) {
    const bimOption = new BUI.Option()
    bimOption.label = key
    dropdown.append(bimOption)
  }

  dropdown.addEventListener("change", () => {
    const value = dropdown.value[0] as string
    const webhookURL = webhooks[value]
    discordIntegration.config.webhookURL = webhookURL
    textInput.focus()
  })

  const modal = BUI.Component.create<HTMLDialogElement>(() => {
    return BUI.html`
       <dialog>
        <bim-button style="position: absolute; top: 30px; right: 30px;" @click=${() => modal.close()} icon="material-symbols:close"></bim-button> 
        <bim-panel style="width: 20rem;">
          <bim-panel-section label="Send Discord Message" fixed>
          <bim-label style="white-space: normal;">Choose Channel</bim-label>
            ${dropdown}
            <bim-label style="white-space: normal;">The message you write here will be sent to the Discord channel associated with this project based on the settings.</bim-label>
            ${textInput}
            <bim-button @click=${sendMessage} label="Send" icon="iconoir:send-diagonal-solid"></bim-button> 
          </bim-panel-section> 
        </bim-panel>
      </dialog>
    `
  })

  document.body.append(modal)
  
  return BUI.Component.create<BUI.ToolbarSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Communication" icon="lets-icons:chat-fill">
        <bim-button @click=${() => modal.showModal()} label="Send Message" icon="flowbite:discord-solid"></bim-button>
      </bim-toolbar-section>
    `
  })
}