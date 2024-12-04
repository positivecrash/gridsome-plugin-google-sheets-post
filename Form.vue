<template>
  <form v-bind="$attrs" @submit.prevent="onSubmit" :class="{'captcha-error': isError}">

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
    this.$refs.invisibleHcaptcha.execute();
    this.$emit('gsp-beforesubmit', this.$response);
  },

  onVerify: async function (token, ekey) {
    let 
      response = '',
      data = this.$el.querySelectorAll('[data-gsp-data]');

    data.forEach(function(item, index, array) {
      if (response != '') {
        response += '&'
      }
      response += item.dataset.gspName + '=' + encodeURIComponent(item.dataset.gspData)
    });

    this.verified = true;
    await this.$gspPostForm(this.gscriptID, response);
    this.$emit('gsp-onsubmit', this.$response, response);
  },


  onError: function () {
    this.$response = 'captcha error';
    this.token = null;
    this.eKey = null;
    this.isError = true;
  }
},

}

</script>