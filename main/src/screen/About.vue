<script setup>
import { onMounted, ref } from 'vue';
const versions = ref({})
onMounted(async () => {
    versions.value = await api.call('versions')
})
</script>
<template>
    <h2>About</h2>
    <div>{{ $t('message.about.version', versions) }}</div>
</template>