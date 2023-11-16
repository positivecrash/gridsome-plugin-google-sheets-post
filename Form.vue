<template>
  <form ref="form"  @submit.prevent="onSubmit" :class="{'captcha-error': isError}">

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
    isError: false,
    verified: false,
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
    console.log('Submitting the invisible hCaptcha', this.$refs.invisibleHcaptcha);
    this.$refs.invisibleHcaptcha.execute();
  },

  onVerify: async function (token, ekey) {
    var 
      response = '',
      data = document.querySelectorAll('[data-gsp-data]');

    data.forEach(function(item, index, array) {
      if (response != '') {
        response += '&'
      }
      response += item.dataset.gspName + '=' + encodeURIComponent(item.dataset.gspData)
    });

    this.verified = true;
    console.log(token)
    await this.$gspPostForm(this.gscriptID, response)
  },


  onError: function () {
    console.log('captcha error')
    this.token = null;
    this.eKey = null;
    this.isError = true;
  }
},

}

</script>

<style></style>