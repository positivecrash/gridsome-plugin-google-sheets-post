<template>
  <form v-bind="$attrs" @submit.prevent="onSubmit">

      <vue-hcaptcha
        ref="invisibleHcaptcha"
        :sitekey="siteKey"
        size="invisible"
        theme="dark"
        @verify="onVerify"
        @error="onError"
      />

    <slot/>

  </form>

</template>

<script>

import VueHcaptcha from '@hcaptcha/vue-hcaptcha';

export default {
name: 'gspForm',

props: {
  gscriptID: {
    type: String,
    required: true,
    default: null
  },
  siteKey: {
    type: String,
    require: true
  }
},

components: {
  VueHcaptcha
},

data() {
  return {
    captchaError: false,
    token: null,
    eKey: null,
  }
},

metaInfo: {
  script: [
    {
      body: true
    }
  ]
},

methods: {
  onSubmit: function () {
    this.$refs.invisibleHcaptcha.execute();
    this.$emit('gsp-beforesubmit');
  },

  onVerify: async function (token, ekey) {
    var response = '';
    var data = this.$el.querySelectorAll('[data-gsp-data]');

    data.forEach(function(item, index, array) {
      if (response != '') {
        response += '&'
      }
      response += item.dataset.gspName + '=' + encodeURIComponent(item.dataset.gspData)
    });

    fetch( 'https://script.google.com/macros/s/' + this.gscriptID + '/exec',
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: response
    }).then((responce) => {
            responce.json().then((data) => {
                this.$emit('gsp-onsubmit', data, response);
                return data;
            }).catch((err) => {
                this.$emit('gsp-onsubmit', err, response);
                return err;
            }) 
        }).catch((err) => {
            this.$emit('gsp-onsubmit', err, response);
            return err;
        }) 
  },


  onError: function () {
    this.token = null;
    this.eKey = null;
    this.$emit('gsp-oncaptchanotverified');
  }
},

}

</script>