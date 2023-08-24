export const format = (message: string) => {
    return message.split("\n").map((line) => {
        return line.replace(/^[0-9]+\. /g, "").replace(/^- /g, "").trim();
    });
}