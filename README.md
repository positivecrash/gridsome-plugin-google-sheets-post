- This plugin for posting any data from form to Google Sheets.
- Useful for contact forms etc.
- No limitations for form element.
- Built-in [captcha](https://github.com/robiveli/js-captcha)

## Get started

### `gridsome.config.js`

```js
module.exports = {
  plugins: [
    {
      use: "gridsome-plugin-google-sheets-post"
    }
  ]
}
```

## Usage 1

With built-in submit events, captcha and auto forming request

Your Vue template:
```html
<gsp-form :gscriptID="gscript">
    <input type="text" placeholder="Your data" data-gsp-name="data-name" :data-gsp-data="data" v-model="data"/>
    <button>Send</button>
</gsp-form>
```
```js
<script>
export default {
  
    data() {
      return {
       
        gscript:  process.env.GRIDSOME_GSCRIPTID,

        data: ''

      }
    }
}
</script>
```

Watch result with `$response`


## Usage 2

You can use only function for sending data to Google Sheet `$gspPostForm`

```js
<script>
export default {
  
    data() {
      return {
       
        gscript:  process.env.GRIDSOME_GSCRIPTID,

        data1: '',
        data2: ''

      }
    },

    methods: {
        onSubmit: async function () {
            let response = 'data1=' + encodeURIComponent(this.data1) + '&data2=' + encodeURIComponent(this.data2)
            await this.$gspPostForm(this.gscript, response)
            }
        }
    }
}
</script>
```

## Forming Google Sheet

You may use script template below and follow the steps:

1. Create Google Sheet doc in your account: first column named **sn** + columns named as your fields in form + column named **timestamp**. You may rewrite script and use other tech columns as you like.
2. Open Apps Script and write script for posting data in doc + you can send email notifications for any person (admin or user). See example below.
3. Than deploy script. If you use script from example below: choose **setup** function and run this; choose **doPost** and Deploy it. Give writes for 'all' so your website can write to the sheet.
4. Copy script id from deploying and setup [environmental variable](https://gridsome.org/docs/environment-variables/)

**Script example:**
Please watch sendEmail function, you need to edit it according to your data. Also you can choose not to send email, so just delete this function.

```js
function doPost(e){
  return handleResponse(e);
}

//  Enter sheet name where data is to be written below
var SHEET_NAME = "Sheet1";

var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service

function handleResponse(e) {
  // Google the LockService prevents concurrent access overwritting data
  // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
  // we want a public lock, one that locks for all invocations
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
  
  try {
   
    // next set where we write the data - you could write to multiple/alternate destinations
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName(SHEET_NAME);
    
    // we'll assume header is in row 1 but you can override with header_row in GET/POST data
    var headRow = e.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = []; 
    // loop through the header columns
    for (i in headers){
      if (headers[i] == "timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else if(headers[i] == "sn") {
        row.push(sheet.getLastRow());
      } else { // else use header name to get data
        row.push(e.parameter[headers[i]]);
      }
    }
    // more efficient to set values as [][] array than individually
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    
    //send email
    sendEmail(e.parameter);
    
    // return json success results
    return ContentService
          .createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
  } catch(e){
    // if error return this
    return ContentService
          .createTextOutput(JSON.stringify({"result":"error", "error": e}))
          .setMimeType(ContentService.MimeType.JSON);
  } finally { //release lock
    lock.releaseLock();
  }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}

function sendEmail(data) {

  var email = ''; // automatic email responce to user
  var emailFrom = '';
  var emailAdmin = ''; // notification for admin

  var data = '';
  var timestamp = new Date();
  var adminBody = '';
  var userBody = '';
  var userTitle = '';

  for (let key in data){
   if(data.hasOwnProperty(key)){
     if (key === 'data') { name = data[key]; }
     if (key === 'email') { email = data[key]; }
   }
  }

  adminTitle = 'New form apply';
  adminBody = 'New form apply on website';
  userTitle = 'Your application';
  userBody = 'Your apply has been sent';

  if (email != '') {
    GmailApp.sendEmail(emailAdmin, adminTitle, '', {
      name: 'yourwebsite.com',
      from: emailFrom,
      htmlBody: adminBody
    });
    
    GmailApp.sendEmail(email, userTitle, '', {
      name: 'yourwebsite.com',
      from: emailFrom,
      htmlBody: userBody
    });
  }
}
```


## Setting up captcha

[Captcha](https://github.com/robiveli/js-captcha) is ready for use without any additional settings but you can change captcha styling: 


Your Vue template:
```html
<gsp-form :gscriptID="gscript" :captchaStyle="captchaStyle">
    <input type="text" placeholder="Your data" data-gsp-name="data-name" :data-gsp-data="data" v-model="data"/>
    <button>Send</button>
</gsp-form>
```

```js
<script>
export default {
  
    data() {
      return {
       
        gscript:  process.env.GRIDSOME_GSCRIPTID,
        captchaStyle: {     
          width: 100,
          height: 25,
          textBaseline: 'top',
          font: '25px Arial',
          textAlign: 'left',
          fillStyle: '#333'
        }

        data: ''

      }
    }
}
</script>
```


## TODO

- Move to another captcha
- Make local registration of component possible


## Troubleshoting

If you have any troubles, [create issue](https://github.com/positivecrash/gridsome-plugin-google-sheets-post/issues) on Github