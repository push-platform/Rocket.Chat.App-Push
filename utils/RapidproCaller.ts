import { IRead, IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors"
import { RocketCaller } from "./RocketCaller"

export class RapidproCaller {

    public static async getAuthorizationHeader(read : IRead) {
        const auth_token = await read.getEnvironmentReader().getSettings().getValueById("push_token")
        return {Authorization: `Token ${auth_token}`}
    }

    public static async getBaseUrl(read : IRead) {
        const base_url = await read.getEnvironmentReader().getSettings().getValueById("base_url")
        return base_url
    }
    
    public static async rapidGetLogMessages(read : IRead, http : IHttp, contact_uuid : string, after? : string,) : Promise<any> {

        const messages_response = await this.rapidGetContactMessages(read, http, contact_uuid, after)
        let messages = messages_response.data.results.reverse()

        // TODO: Check if logMessage really works in all edge cases 
        let logMessage = "Log:\n";
        messages.map( message => {
            let time = RapidproCaller.getDateTime(message)
            let icon = message.direction === "out" ? `:robot: ${time}` : `:bust_in_silhouette: ${time}`
            let lines = RapidproCaller.getUserMessage(message)
            let firstLine = RapidproCaller.formatUserMessage(lines.shift(), message)
            
            let text = `> ${icon} ${firstLine}`

            lines.map( line => {
                if(line.length > 0) {
                    let msg = RapidproCaller.formatUserMessage(line, message)
                    text = text.concat(`\n>${msg}`)
                }
            })
            logMessage = logMessage.concat(text + "\n")
        })

        return logMessage ? (messages.length ? logMessage : null) : null 
    }

    public static async rapidGetContactMessages(read : IRead, http : IHttp, token : string, after) : Promise<IHttpResponse>{

        
        const base_url = await RapidproCaller.getBaseUrl(read)

        const url = `https://${base_url}/api/v2/messages.json?contact=${token}&after=${after}`

        // TODO: RCAdmin checks if after is a string, but after analysis i dont think after can be anything else than a string, check if thats true

        const contactMessagesResponse = await http.get(url, {
            headers: await RapidproCaller.getAuthorizationHeader(read)
        })

        return contactMessagesResponse

    }

    public static getDateTime(message) {
        const sentOn = new Date(message["created_on"])
        sentOn.setHours(sentOn.getHours() - (sentOn.getTimezoneOffset() / 60))

        const month = sentOn.getMonth(), day = sentOn.getDay(), year = sentOn.getFullYear()
        const hour = sentOn.getHours(), minutes = sentOn.getMinutes(), seconds = sentOn.getSeconds()

        const date = `${month}/${day}/${year} às ${hour}:${minutes}:${seconds}`

        return `[${date}]: `
    }

    public static getUserMessage(message) {
        const attachments = message.attachments

        if (attachments && attachments.length > 0) {
            let urls : string[] = []
            attachments.map( e => {
                urls.push(e["url"])
            }) 
            return urls
        }

        return message.text.split("\n")

    }

    public static formatUserMessage(line, message) {
        return message.direction === "out" ? line : "`" + line + "`"
    }

}