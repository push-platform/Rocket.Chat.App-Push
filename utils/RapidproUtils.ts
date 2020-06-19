import { IHttp, IHttpResponse, IRead } from '@rocket.chat/apps-engine/definition/accessors';

export class RapidproUtils {
    private readonly MESSAGE_CHUNK_SIZE: number = 640;

    private read: IRead;
    private http: IHttp;
    private authToken: string;
    private baseUrl: string;
    private closeTicket: string;

    public constructor(read: IRead, http: IHttp, baseUrl: string, authToken: string, closeTicket: string) {
        this.read = read;
        this.http = http;
        this.baseUrl = baseUrl;
        this.authToken = authToken;
        this.closeTicket = closeTicket;
    }

    public getHeaders() {
        const auth = this.authToken;
        return {Authorization: `Token ${auth}`};
    }
    public getCloseTicket() {
        return this.closeTicket;
    }

    public async getLogMessages(token: string, after: string): Promise<any> {

        const messagesResponse = await this.getContactMessages(token, after);
        const messages = messagesResponse.data.results;

        // TODO: Check if logMessage really works in all edge cases
        let logMessage = 'Log:\n';
        for (let i = messages.length - 1; i >= 0; i--) {
            const time = this.getDateTime(messages[i]);
            const icon = messages[i].direction === 'out' ? `:robot: ${time}` : `:bust_in_silhouette: ${time}`;
            const lines = this.getUserMessage(messages[i]);
            const firstLine = this.formatUserMessage(lines.shift(), messages[i]);

            let text = `> ${icon} ${firstLine}`;

            lines.map( (line) => {
                if (line.length > 0) {
                    const msg = this.formatUserMessage(line, messages[i]);
                    text = text.concat(`\n>${msg}`);
                }
            });
            logMessage = logMessage.concat(text + '\n');
        }

        return messages ? (messages.length > 0 ? logMessage : null) : null;
    }

    public async getContactMessages(token: string, after: string): Promise<IHttpResponse> {

        const baseUrl = this.baseUrl;

        const url = `https://${baseUrl}/api/v2/messages.json?contact=${token}&after=${after}`;

        // TODO: RCAdmin checks if after is a string, but after analysis i dont think after can be anything else than a string, check if thats true

        const contactMessagesResponse = await this.http.get(url, {
            headers: this.getHeaders(),
        });

        console.log(`Contact Messages Response: ${JSON.stringify(contactMessagesResponse)}`);

        return contactMessagesResponse;

    }

    public getDateTime(message: any) {
        const sentOn = new Date(message.created_on);
        // TODO: check timezone effects
        // sentOn.setHours(sentOn.getHours() - (sentOn.getTimezoneOffset() / 60))

        const month = String(sentOn.getMonth()).padStart(2, '0');
        const day = String(sentOn.getDay()).padStart(2, '0');
        const year = String(sentOn.getFullYear()).padStart(2, '0');
        const hour = String(sentOn.getHours()).padStart(2, '0');
        const minutes = String(sentOn.getMinutes()).padStart(2, '0');
        const seconds = String(sentOn.getSeconds()).padStart(2, '0');

        const date = `${month}/${day}/${year} às ${hour}:${minutes}:${seconds}`;

        return `[${date}]: `;
    }

    public getUserMessage(message: any) {
        const attachments = message.attachments;

        if (attachments && attachments.length > 0) {
            const urls: Array<string> = [];
            attachments.map( (e) => {
                urls.push(e.url);
            });
            return urls;
        }

        return message.text.split('\n');

    }

    public formatUserMessage(line: string, message: any) {
        return message.direction === 'out' ? line : '`' + line + '`';
    }

    public async broadcastMessages(messages: Array<any>, contacts: Array<string>) {
        messages.map( (message) => {
            const msgText = message.msg;

            if (msgText.length === 0) {
                // TODO: Check how to handle attachments
                // msgText = getAttachmentUrl(message, contacts)
            } else {
                // TODO: Check how to handle emojis
                // msgText = emojione.shortnameToImage(msgText)
                const msgs = this.chunkString(msgText, this.MESSAGE_CHUNK_SIZE);

                if (!msgs) {
                    return;
                }

                msgs.map( async (msg) => {
                    await this.broadcastMessage(msg, contacts);
                });

            }

        });
    }

    public chunkString(str: string, length: number) {
        return str.match(new RegExp('[\s\S]{1,' + length + '}', 'g'));
    }

    // TODO: Check if there's a way to create a generic function to build payloads from n arguments
    public buildBroadcastPayload(text: string, contacts?: Array<string>, urns?: Array<string>, groups?: Array<string>): object {
        const payload = {
            text,
        };

        if (urns) {
            payload['urns'] = urns;
        }
        if (contacts) {
            payload['contacts'] = contacts;
        }
        if (groups) {
            payload['groups'] = groups;
        }

        return payload;
    }

    public buildFlowStartPayload(
        flow: string,
        contacts?: Array<string>,
        urns?: Array<string>,
        groups?: Array<string>,
        restartParticipants?: boolean,
        params?: object) {

        const payload = {
            flow,
        };

        if (urns) {
            payload['urns'] = urns;
        }
        if (contacts) {
            payload['contacts'] = contacts;
        }
        if (groups) {
            payload['groups'] = groups;
        }
        if (restartParticipants) {
            payload['restart_participants'] = restartParticipants;
        }
        if (params) {
            payload['params'] = params;
        }

        return payload;
    }

    public async broadcastMessage(message: string, contacts: Array<string>) {

        const baseUrl = this.baseUrl;
        const url = `https://${baseUrl}/api/v2/broadcasts.json`;

        const payload = this.buildBroadcastPayload(message, contacts = contacts);

        await this.http.post(url, {
            headers: this.getHeaders(),
            data: payload,
        });
    }

    public async closeSession(extra: object, contacts: Array<string>) {

        console.log('Starting close flow');

        const baseUrl = this.baseUrl;
        const url = `https://${baseUrl}/api/v2/flow_starts.json`;

        const payload = this.buildFlowStartPayload(this.closeTicket, contacts, undefined, undefined, true, extra);

        await this.http.post(url, {
            headers: this.getHeaders(),
            data: payload,
        });

    }

}
