<template>
  <div class="stats">
    <div class="stat">
      <p>
        Count:
        <span>{{ count}}</span>
      </p>
    </div>
    <div class="stat">
      <p>
        Average:
        <span>{{ avg }}</span>
      </p>
    </div>
    <div class="stat">
      <p>
        Min:
        <span>{{ min }}</span>
      </p>
    </div>
    <div class="stat">
      <p>
        Max:
        <span>{{ max }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import { stats } from "../mixins/myMixin.js";

export default {
  props: ["filteredData", "lineVariable"],
  mixins: [stats]
};
</script>

<style scoped>
.stats {
  display: flex;
  margin-top: 2rem;
}

.stat {
  margin-right: 3rem;
}
</style>