<template>
  <header class="h-12 flex bg-gray-100 dark:bg-gray-800 drag">
    <div v-if="isWin" class="flex p-0 m-0">
      <XCircleIcon @click="closeWin" class="mt-4 ml-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag"></XCircleIcon>
      <MinusCircleIcon @click="minimalWin" class="mt-4 ml-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag">
      </MinusCircleIcon>
      <ViewColumnsIcon @click="triggleRootPanel" class="ml-4 mt-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag" />
    </div>
    <div v-else class="flex p-0 m-0">
      <ViewColumnsIcon @click="triggleRootPanel" class="ml-24 mt-4 h-6 w-6 text-gray-500 hover:text-gray-900 nodrag" />
    </div>
  </header>
  <main class="p-4 flex flex-col flex-1 bg-gray-100 dark:bg-slate-600 drag">
    <div>
      <div class="text-xs text-gray-400 font-sans font-bold">Smart Feeds</div>
      <div class="p-1">
        <div @click="setFocus('fair')" class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1"
          :class="focus == 'fair' ? ['bg-gray-300'] : [] ">
          <NewspaperIcon class="h-6 w-6 text-green-500 mr-1" /> <span class="flex-1">Fair</span>
          <span v-if="numbers.fair" class="e2e-today"> {{ numbers.fair }} </span>
        </div>
        <div @click="setFocus('today')" class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1"
          :class="focus == 'today' ? ['bg-gray-300'] : [] ">
          <SunIcon class="h-6 w-6 text-orange-500 mr-1" /> <span class="flex-1">Today</span>
          <span v-if="numbers.today" class="e2e-today"> {{ numbers.today }} </span>
        </div>
        <div @click="setFocus('unread')" class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1"
          :class="focus == 'unread' ? ['bg-gray-300'] : [] ">
          <CheckBadgeIcon class="h-6 w-6 text-blue-500 mr-1" /> <span class="flex-1">Unread</span>
          <span class="e2e-unread" v-if="numbers.read"> {{ numbers.read }} </span>
        </div>
        <div @click="setFocus('starred')" class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1"
          :class="focus == 'starred' ? ['bg-gray-300'] : [] ">
          <StarIcon class="h-6 w-6 text-yellow-500 mr-1" /> <span class="flex-1">Starred</span>
          <span v-if="numbers.starred" class="e2e-starred"> {{ numbers.starred }} </span>
        </div>
      </div>
    </div>

    <div>
      <div class="text-xs text-gray-400 font-sans font-bold">My Planets</div>
      <div class="p-1">
        <div v-for="(planet,idx) in planets" :key="planet.id" @contextmenu="planetCtxMenu(planet)"
          @click="setFocus(`my:${planet.id}`)"
          class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1 nodrag cursor-default mb-1"
          :class="focus == `my:${planet.id}` ? ['bg-gray-300', `e2e-mp-${idx}`] : [`e2e-mp-${idx}`] ">
          <Avatar :image="planet.avatar" :placeholder="planet.name" extraClass="text-xs" /> <span class="ml-2">{{
          planet.name }}</span>
          <div class="flex-1"></div>
          <svg v-if="planet.busy" aria-hidden="true"
            class="mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor" />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill" />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex-1">
      <div class="text-xs text-gray-400 font-sans font-bold">Following Planets</div>
      <div class="p-1">
        <div v-for="(p, idx) in following" :key="p.id" @contextmenu="followingCtxMenu(p)"
          @click="setFocus(`following:${p.id}`)"
          class="hover:bg-blue-500 nodrag flex text-sm items-center rounded px-4 py-1 mb-1"
          :class="focus == `following:${p.id}` ? ['bg-gray-300', `e2e-fp-${idx}`] : [`e2e-fp-${idx}`] ">
          <Avatar :image="p.avatar" :placeholder="p.name" extraClass="text-xs" /> <span class="ml-2">{{ p.name }}</span>
          <div class="flex-1"></div>
          <svg v-if="p.busy" aria-hidden="true"
            class="mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor" />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill" />
          </svg>
          <span v-else-if="numbers[`following:${p.id}`]"> {{ numbers[`following:${p.id}`] }} </span>
        </div>
      </div>
    </div>

    <div class="flex flex-row items-center">
      <span v-if="online" class="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
      <span v-if="online" class="text-xs flex-1">Online({{peers}})</span>
      <span v-if="!online" class="h-3 w-3 rounded-full bg-red-500 mr-1"></span>
      <span v-if="!online" class="text-xs flex-1">Offline</span>
      <PlusIcon class="h-4 w-4 mx-2 nodrag" @click="showMenu" />
    </div>

  </main>
</template>
<script>
import Avatar from '../components/Avatar.vue'
import { ViewColumnsIcon, NewspaperIcon, SunIcon, CheckBadgeIcon, StarIcon, PlusIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/vue/24/outline'
import { mapState, mapWritableState } from 'pinia';
import { useIPFSStore } from '../stores/ipfs';

export default {
  watch: {
    focus() {
      console.log('focus change to', this.focus)
    }
  },
  components: {
    ViewColumnsIcon, SunIcon, NewspaperIcon, CheckBadgeIcon, StarIcon, Avatar, PlusIcon, XCircleIcon, MinusCircleIcon
  },
  computed: {
    ...mapState(useIPFSStore, ['online', 'peers', 'planets', 'following', 'numbers']),
    ...mapWritableState(useIPFSStore, ['focus']),
    isWin() {
      return (navigator.userAgent.indexOf("Win") != -1)
    }
  },
  methods: {
    showMenu() {
      api.send('ipcCreateFollowMenu')
    },
    setFocus(value) {
      this.focus = value
      api.send('ipcSetSidebarFocus', value)
    },
    planetCtxMenu(p) {
      api.send('ipcPlanetCtxMenu', JSON.parse(JSON.stringify(p)))
    },
    followingCtxMenu(p) {
      api.send('ipcFollowingCtxMenu', JSON.parse(JSON.stringify(p)))
    },
    triggleRootPanel() {
      api.send('ipcTriggleRootPanel',)
    },
    closeWin() {
      api.send('ipcCloseWin')
    },
    minimalWin() {
      api.send('ipcMinimalWin')
    }

  }
}

</script>