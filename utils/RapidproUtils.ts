import { IRead, IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors"
import { MESSAGE_CHUNK_SIZE } from './settings'
// import { RocketUtils } from "./RocketUtils"

export class RapidproUtils {
    private read : IRead;
    private http: IHttp;
    private authToken : string;
    private baseUrl : string;
    private closeTicket : string;

    public constructor(read : IRead, http : IHttp, baseUrl, authToken, closeTicket) {
        this.read = read;
        this.http = http;
        this.baseUrl = baseUrl;
        this.authToken = authToken;
        this.closeTicket = closeTicket;
    }

    public getAuthorizationHeader() {
        const auth = this.authToken
        return {Authorization: `Token ${auth}`}
    }
    public getCloseTicket() {
        return this.closeTicket
    }

    public async getLogMessages(contact_uuid : string, after? : string,) : Promise<any> {

        const messages_response = await this.getContactMessages(contact_uuid, after)
        let messages = messages_response.data.results.reverse()

        // TODO: Check if logMessage really works in all edge cases 
        let logMessage = "Log:\n";
        messages.map( message => {
            let time = this.getDateTime(message)
            let icon = message.direction === "out" ? `:robot: ${time}` : `:bust_in_silhouette: ${time}`
            let lines = this.getUserMessage(message)
            let firstLine = this.formatUserMessage(lines.shift(), message)
            
            let text = `> ${icon} ${firstLine}`

            lines.map( line => {
                if(line.length > 0) {
                    let msg = this.formatUserMessage(line, message)
                    text = text.concat(`\n>${msg}`)
                }
            })
            logMessage = logMessage.concat(text + "\n")
        })

        return logMessage ? (messages.length ? logMessage : null) : null 
    }

    public async getContactMessages(token : string, after) : Promise<IHttpResponse>{

        const baseUrl = this.baseUrl

        const url = `https://${baseUrl}/api/v2/messages.json?contact=${token}&after=${after}`

        // TODO: RCAdmin checks if after is a string, but after analysis i dont think after can be anything else than a string, check if thats true

        const contactMessagesResponse = await this.http.get(url, {
            headers: this.getAuthorizationHeader()
        })

        return contactMessagesResponse

    }

    public getDateTime(message) {
        const sentOn = new Date(message["created_on"])
        // TODO: check timezone effects
        // sentOn.setHours(sentOn.getHours() - (sentOn.getTimezoneOffset() / 60))

        const month = String(sentOn.getMonth()).padStart(2, '0')
        const day = String(sentOn.getDay()).padStart(2, '0')
        const year = String(sentOn.getFullYear()).padStart(2, '0')
        const hour = String(sentOn.getHours()).padStart(2, '0')
        const minutes = String(sentOn.getMinutes()).padStart(2, '0')
        const seconds = String(sentOn.getSeconds()).padStart(2, '0')

        const date = `${month}/${day}/${year} às ${hour}:${minutes}:${seconds}`

        return `[${date}]: `
    }

    public getUserMessage(message) {
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

    public formatUserMessage(line, message) {
        return message.direction === "out" ? line : "`" + line + "`"
    }

    public async broadcastMessages(messages, contacts) {
        messages.map( message => {
            let msgText = message["msg"]

            if(msgText.length === 0) {
                // TODO: Check how to handle attachments
                // msgText = getAttachmentUrl(message, contacts)
            } else {
                // TODO: Check how to handle emojis
                // msgText = emojione.shortnameToImage(msgText)
                let msgs = this.chunkString(msgText, MESSAGE_CHUNK_SIZE)

                msgs.map( async msg => {
                    await this.broadcastMessage(msg, contacts)
                })

            }

        })
    }

    public chunkString(str, length) {
        return str.match(new RegExp('.{1,' + length + '}', 'g'));
    }

    // TODO: Check if there's a way to create a generic function to build payloads from n arguments
    public buildBroadcastPayload(text : string, contacts? : Array<string>, urns? : Array<string>, groups? : Array<string>) {
        let payload = {
            text: text
        }

        if(urns) {
            payload["urns"] = urns
        }
        if(contacts) {
            payload["contacts"] = contacts
        }
        if(groups) {
            payload["groups"] = groups
        }

        return payload        
    }

    public buildFlowStartPayload(flow, contacts? : Array<string>, urns? : Array<string>, groups? : Array<string>, restartParticipants? : boolean, params? : object) {
        let payload = {
            flow: flow
        }

        if(urns) {
            payload["urns"] = urns
        }
        if(contacts) {
            payload["contacts"] = contacts
        }
        if(groups) {
            payload["groups"] = groups
        }
        if(restartParticipants) {
            payload["restart_participants"] = restartParticipants
        }
        if(params) {
            payload["params"] = params
        }

        return payload
    }

    public async broadcastMessage(message : string, contacts : Array<string>) {

        const baseUrl = this.baseUrl;
        const url = `https://${baseUrl}/api/v2/broadcasts.json`;

        const payload = this.buildBroadcastPayload(message, contacts=contacts)

        await this.http.post(url, {
            headers: this.getAuthorizationHeader(),
            data: payload
        })
    }

    public async closeSession(extra, contacts) {

        console.log("Starting close flow")

        const baseUrl = this.baseUrl;
        const url = `https://${baseUrl}/api/v2/flow_starts.json`;

        const closeTicket = this.getCloseTicket()
        const payload = this.buildFlowStartPayload(closeTicket, contacts, undefined, undefined, true, extra)

        await this.http.post(url, {
            headers: this.getAuthorizationHeader(),
            data: payload 
        })

    }

}