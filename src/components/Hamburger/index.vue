<template>
  <div style="padding: 0 15px;" @click="toggleClick">
    <span class="el-icon-s-unfold" v-if="isActive==false"   :class="{'is-active':isActive}"  ></span>
    <span class="el-icon-s-fold" v-if="isActive==true"   :class="{'is-active':isActive}"  ></span>
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  mounted(){
    // console.log(this.isActive)
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
.el-icon-s-unfold, .el-icon-s-fold{
  color:#bbb;
  font-size:20px;
  margin-top:14px;
}
</style>
