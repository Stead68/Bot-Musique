const url = require('url')
const request = require('request')
const cheerio = require('cheerio')

class Track {
    constructor (link, owner) {
        this.link = link
        this.owner = owner
        this.title = ''

        // When track is skipped, busted = true
        this.busted = false

        // When for a reason, bot can't find a video element in page, likely when video is restricted, blocked = true
        this.blocked = false

        // This is the multiplier of the experience earned during music.
        this.multiplier = 1
    }

    AdvancedCheck () {
        let promise = new Promise((resolve, reject) => {
            let req = request(this.link)
            let body = ''

            req.on('response', response => {
                response.on('data', chunk => body += chunk)

                response.on('end', () => {
                    let $ = cheerio.load(body)

                    this.title = $('title').text().toString().replace(" - YouTube", "")

                    resolve(true)
                })
            })
        })

        return promise
    }

    Verify () {
        let promise = new Promise(async (resolve, reject) => {
            let parts = url.parse(this.link)

            // To-Do: Advanced check but i'm too lazy yet...
            if (parts.host === 'youtu.be' || parts.host === 'www.youtube.com') {
                let verified = await this.AdvancedCheck()

                resolve(verified)
            } else {
                resolve(false)
            }
        })

        return promise
    }
}

module.exports = Track