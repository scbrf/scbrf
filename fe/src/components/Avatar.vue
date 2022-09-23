<template>
    <div class="avatar" :class="image ? [] : ['placeholder']">
        <div class="rounded-full w-6" :class="!image? ['bg-neutral-focus', 'text-neutral-content'] : []">
            <span v-if="!image" class="text-xs">{{ placeholder.substr(0,1) }}</span>
            <img v-else :src="image" />
        </div>
    </div>
</template>
<script>
export default {
    props: ['placeholder', 'image']
}
</script>