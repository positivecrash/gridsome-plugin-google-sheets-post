import gspForm from './Form.vue'

export default function (Vue, options, { appOptions, router, head }) {
    
  
    /* Register globally form component */
    /* TODO: local registration */
    Vue.component('gspForm', gspForm)

    Vue.prototype.$response = 'init'

    /* Post form and get response */
    async function gspPostForm(script, request) {

        Vue.prototype.$response = 'wait'

        if(!request) {
            console.error('Gridsome-plugin-google-sheets $gsPostForm method is missing a required "request" in $PostGoogleSheets')
            return
        }

        if(!script) {
            console.error('Gridsome-plugin-google-sheets $gsPostForm method is missing a required "script" in $PostGoogleSheets')
            return
        }

        let response = await fetch( 'https://script.google.com/macros/s/' + script + '/exec',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: request
        })

        if (response.ok) {
            Vue.prototype.$response = 'success'
            return true
        } else {
            Vue.prototype.$response = 'error'
            return response.status
        }
        
    }

     // Helper for using in app
     Vue.prototype.$gspPostForm = gspPostForm
    

    

}