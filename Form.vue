<template>
  <form ref="form"  @submit.prevent="onSubmit" v-if="!isDisabled" :class="{'captcha-error': isError}">

    <input @input="checkCaptcha" :model="captcha" v-if="!isSuccess && isCaptchaShown" class="jCaptcha" type="text" placeholder="Type in captcha result please">

    <!-- honeypot field. This field should trigger captcha for suspicious (non-human) users -->
    <label for="user-type">user tracker </label><input @input="checkUserType" id="user-type" name="user-type" size="40" tabindex="-1" type="text" :modal="userType" />

    <slot/>

  </form>

  <div class="noForm" v-else>
    <p>Too many tries were executed.</p>
    <p>If you are sure you are human, please, try again a bit later!</p>
  </div>

</template>

<script>

import jCaptcha from 'js-captcha';

export default {
name: 'gspForm',

props: {
  gscriptID: {
    type: String,
    required: true,
    default: null
  },
  captchaStyle: {
    type: Object,
    required: false,
    default: () => ({
      width: 100,
      height: 15,
      textBaseline: 'top',
      font: '15px Arial',
      textAlign: 'left',
      fillStyle: '#6E9BEF'
    })
  }
},

data() {
  return {
    captcha: '',
    userType: '',
    time: null,
    formElementsCount: null,
    allInputs : [],
    allTextareas: [],
    isError: false,
    isSuccess: false,
    isDisabled: false,
    isSuspiciousUser: false,
    isCaptchaShown: false,
  }
},

metaInfo: {
  script: [
    {
      body: true
    }
  ]
},

computed: {
  getCaptcha: function () {
    return new jCaptcha({
      el: '.jCaptcha',
      canvasClass: 'jCaptchaCanvas',
      canvasStyle: {
          width: this.captchaStyle.width,
          height: this.captchaStyle.height,
          textBaseline: this.captchaStyle.textBaseline,
          font: this.captchaStyle.font,
          textAlign: this.captchaStyle.left,
          fillStyle: this.captchaStyle.fillStyle
      },
      callback: ( response, $captchaInputElement, numberOfTries ) => {
          if ( response == 'success' ) {
              this.onVerify();
              this.time = null;
              this.formTime = null;
          }
          if ( response == 'error' ) {
              this.onError();

              if (numberOfTries === 3) {
                  this.isDisabled = true

                  setTimeout(() => {
                    this.isError = false,
                    this.isSuccess = false,
                    this.isSuspiciousUser = false
                    this.isDisabled = false
                    this.time = null;
                    this.formTime = null;
                  }, 5000)
              }
          }
      }
    });
  },

  acceptableTime() {

    if(this.formElementsCount === 1) {
      return 420
    }

    if (this.formElementsCount < 3) {
      return 2000
    }  else if (this.formElementsCount < 6) {
      return 3000
    }

    return 5500
  }
},

methods: {
  onSubmit: function () {
    if(this.isSuspiciousUser || new Date() - this.time < this.acceptableTime) {
      this.isCaptchaShown = true
      setTimeout(() => {
        this.getCaptcha.validate();
      }, 500)
    } else {
      this.onVerify();
      this.formTime = null;
    }
  },

  onVerify: async function () {
    var 
      response = '',
      data = document.querySelectorAll('[data-gsp-data]');

    data.forEach(function(item, index, array) {
      if (response != '') {
        response += '&'
      }
      response += item.dataset.gspName + '=' + encodeURIComponent(item.dataset.gspData)
    });

    await this.$gspPostForm(this.gscriptID, response)
  },

  onError: function () {
    console.log('captcha error')
    this.isError = true;
  },

  checkUserType: function () {
    this.isSuspiciousUser = true;
  },

  checkCaptcha: function () {
    this.isError = false
  },

  startInteractingWithForm() {
    if(!this.time) {
      this.time = new Date();
    }
  },

  detectFormInteraction(e, elements) {
    if(this.$refs.form && elements) {
      elements.forEach(el => {
        if(e.target === el) {
          this.startInteractingWithForm();
        }
      })
    }
  }
},

mounted() {

  let allFormElements = [];

  this.allInputs =  this.$refs.form.querySelectorAll('input');
  this.allTextareas =  this.$refs.form.querySelectorAll('textarea');

  this.allInputs.forEach(i => {
    if (i.getAttribute('type') !== 'hidden') {
      allFormElements.push(i);
    }
  })

  this.allTextareas.forEach(i => {
    if (i.getAttribute('type') !== 'hidden') {
      allFormElements.push(i);
    }
  })


  // - 1 to remove honeypot from the count
  this.formElementsCount = allFormElements.length - 1;
  
  window.addEventListener('click', (e) => {
    this.detectFormInteraction(e, this.allInputs);
    this.detectFormInteraction(e, this.allTextareas);
  })

},

beforeDestroy() {
  this.time = null;
  window.removeEventListener('click', (e) => {
    this.detectFormInteraction(e, this.allInputs);
    this.detectFormInteraction(e, this.allTextareas);
  })
}

}

</script>

<style>


/* honeypot */
label[for="user-type"], #user-type {
  display: none;
  visibility: hidden;
}
/* honeypot */

form {
  position: relative;
}

.jCaptchaCanvas {
  position: absolute;
  top: -25px;
  left: 15px;
}

.captcha-error button {
  background-color: rgb(181, 3, 0) !important;
  color: #fff !important;
}

/* too many tries error */
div.noForm {
  font-size: 20px;
  padding: 20px;
  color: #fff;
  font-weight: 600;
  font-style: italic;
  background-color: rgba(184, 0, 0, 0.753);
  border: 3px double rgba(24, 24, 24, 0.772);
}

.noForm p {
  margin: 0;
}


</style>