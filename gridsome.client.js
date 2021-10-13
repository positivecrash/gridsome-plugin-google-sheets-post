
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

       try {
            const response = await fetch(options.script, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: request
            })

            if(response.ok) {
                return true
            } else {
                return 'Gridsome-plugin-google-sheets something wrong with the response'
            }
        } catch (error) {
            return error.message
        }
    }

    // Helper for using in app
    Vue.prototype.$PostGoogleSheets = PostDataToSheet

}