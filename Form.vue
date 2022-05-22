<template>
    <form @submit.prevent="onSubmit">

        <slot/>

        <vue-recaptcha
            ref="invisibleRecaptcha"
            @verify="onVerify"
            size="invisible"
            :sitekey="captchaID">
        </vue-recaptcha>

    </form>
</template>

<script>

export default {
  name: 'gspForm',

  components: {
      // TODO: replace Google Captcha with something like hcaptcha (maybe)
      VueRecaptcha: () => import("vue-recaptcha")
  },

  props: {
    gscriptID: {
      type: String,
      required: true,
      default: null
    },
    // "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" //test localhost
    captchaID: {
      type: String,
      required: true,
      default: null
    }
  },

  metaInfo: {
    script: [
      {
        src: 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit',
        body: true
      }
    ]
  },

  methods: {
    onSubmit: function () {
      this.$refs.invisibleRecaptcha.execute()
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
    }
  }

}

</script>

<style>
  .grecaptcha-badge { 
      visibility: hidden;
  }
</style>