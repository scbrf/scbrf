<script setup>
import { useDark } from "@vueuse/core";
import TopBar from './component/TopBar.vue';
useDark()
</script>
<template>
    <TopBar />
    <router-view></router-view>
</template>