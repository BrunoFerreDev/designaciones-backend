(function() {
const { createApp } = Vue;

const app = createApp({
  setup() {
    const state = window.state;

    return {
      state,
      openModal: window.openModal,
      deleteCancha: window.deleteCancha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
