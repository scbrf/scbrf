<template>
    <div class="avatar" :class="image ? [] : ['placeholder']">
        <div class="rounded-full w-6" :class="!image? ['bg-neutral-focus', 'text-neutral-content', ...parentClass] :
        parentClass">
            <span v-if="!image">{{ placeholder.substr(0,1) }}</span>
            <img v-else :src="image" class="w-100 h-100" />
        </div>
    </div>
</template>
<script>
export default {
    props: ['placeholder', 'image', 'extraClass'],
    computed: {
        parentClass() {
            return (this.extraClass || '').split(',')
        }
    }
}
</script>