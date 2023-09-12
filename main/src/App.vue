<script setup>
import { useDark } from "@vueuse/core";
import TopBar from './component/TopBar.vue';
useDark()
</script>
<template>
    <router-view></router-view>
</template>