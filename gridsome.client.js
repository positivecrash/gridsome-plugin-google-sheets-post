
export default function (Vue, options, { appOptions, router, head }) {


    if( !options.script){
        throw new Error(`Gridsome-plugin-google-sheets is missing a required "script" option.`)
    }

    function PostDataToSheet(request) {
        console.log('post')

        if(!request) {
            console.error('Gridsome-plugin-google-sheets is missing a required "request" in $PostGoogleSheets')
            return
        }

        fetch(options.script, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: request
        })
        .then(() => { return true })
        .catch(error => { return false })
    }

    // Helper for using in app
    Vue.prototype.$PostGoogleSheets = PostDataToSheet

}