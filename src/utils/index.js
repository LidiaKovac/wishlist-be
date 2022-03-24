class Response {
    constructor(message, createdElement) {
        this.message = message,
        this.createdElement = createdElement
    }
}

const convertStringInArray = (string) => {
    return string.split(",").map(img => img.replace("wid=40", "wid=1000"))
}

module.exports = {
    response: Response,
    convertImages: convertStringInArray
}