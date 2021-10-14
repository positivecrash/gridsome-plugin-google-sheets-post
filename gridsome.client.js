export default function (Vue, options, { appOptions, router, head }) {


    if( !options.script){
        throw new Error(`Gridsome-plugin-google-sheets is missing a required "script" option.`)
    }

    async function PostDataToSheet(request) {

        if(!request) {
            console.error('Gridsome-plugin-google-sheets is missing a required "request" in $PostGoogleSheets')
            return
        }

        let link = 'https://script.google.com/macros/s/' + options.script + '/exec'

        fetch(link, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: request
            })
        .then(() => { return true})
        .catch(error => { return error.message})
    }

    // Helper for using in app
    Vue.prototype.$PostGoogleSheets = PostDataToSheet

}