<template>
  <div id="chart">
    <h5 class="subtitle">{{ chartTitle }}</h5>
    <select v-model="lineVariable" @change="setDomain()">
      <option disabled selected>Please select one</option>
      <option v-for="heads in headers" :key="heads" :value="heads">{{ heads }}</option>
    </select>
    <Stats :filteredData="filteredData" :lineVariable="lineVariable"/>
    <svg :width="svgWidth" :height="svgHeight">
      <g :transform="`translate(${margin.left}, ${margin.bottom})`" class="the-group">
        <g v-axis:x="scale" :transform="`translate(${0}, ${height})`" class="x-axis"></g>
        <g v-axis:y="scale" class="y-axis"></g>
        <g v-grid:gridLine="scale" class="grid"></g>
        <path
          :class="[showCallOut && setShown === 1 ? 'link-inactive' : (setShown === 1 ? 'link' : 'link-hide')]"
          :d="paths.line"
        ></path>
        <g v-for="(d, i) in filteredData" :key="i">
          <line
            v-if="setShown === 1"
            :x1="scale.x(d.year)"
            :y1="scale.y(d.priceB)"
            :x2="scale.x(d.year)"
            :y2="height"
            :class="[i === selected ? 'selector' : 'selector-inactive']"
          ></line>
          <circle
            v-if="setShown === 1"
            :class="[i === selected ? 'circle-active' : (showCallOut ? 'circle-inactive' : 'circle-up')]"
            :cx="scale.x(d.year)"
            :cy="scale.y(d[lineVariable])"
            r="5"
            @mouseover="showLabel = !showLabel,
            myTooltip(d),select(i)"
            @mouseleave="showLabel = !showLabel, myTooltip(d), select(null)"
          ></circle>
        </g>
        <text y="5.5" x="0" class="axis-title">{{ yLabel }}</text>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import { wh, axis, grid, scale, tooltip } from "../mixins/myMixin.js";
import Stats from "./Stats.vue";

export default {
  name: "line-chart",
  components: { Stats },
  data() {
    return {
      chartTitle: "Line Chart",
      yLabel: "Y Label",
      svgWidth: window.innerWidth * 0.45,
      svgHeight: window.innerHeight * 0.7,
      margin: { top: 50, left: 65, bottom: 20, right: 25 },
      data: [{}],
      domain: {
        x: {
          min: null,
          max: null
        },
        y: {
          min: 0,
          max: 100
        }
      },
      lineVariable: "priceA",
      setShown: 1,
      paths: {
        line: "",
        selector: ""
      },
      pointsLine: [],
      lastHoverPoint: {},
      showLabel: false,
      selected: null,
      showCallOut: false
    };
  },
  mixins: [axis, grid, wh, scale, tooltip],
  computed: {
    filteredData() {
      // return this.data.filter(d => d.set === this.setShown);
      return this.data;
    },
    headers() {
      return d3.keys(this.filteredData[0]);
    }
  },
  created() {
    this.loadData();
  },
  updated() {
    this.updatePath();
  },
  methods: {
    loadData() {
      d3.csv("data/sampledata.csv", d => {
        return {
          year: +d["year"],
          priceA: +d["priceA"],
          priceB: +d["priceB"],
          priceC: +d["priceC"],
          category: d["category"]
        };
      })
        .then(d => {
          // console.log(d);
          return (this.data = d);
        })
        .then(() => {
          this.updatePath();
        });
    },
    createLine: d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveMonotoneX),
    updatePath() {
      // reset line points
      this.pointsLine = [];
      // line
      for (const d of this.filteredData) {
        this.pointsLine.push({
          x: this.scale.x(d.year),
          y: this.scale.y(d[this.lineVariable]),
          max: this.height
        });
      }
      this.paths.line = this.createLine(this.pointsLine);
    },
    setDomain() {
      this.domain.y.max = Math.max(
        ...this.filteredData.map(x => x[this.lineVariable])
      );

      // this.$set(this.domain.y, "max", Math.random() * 500);
    },
    select(index) {
      this.selected = index;
    },

    numFormater(type, el) {
      const numFormatT = d3.format(",d");
      return numFormatT(el) + (type === "per" ? "%" : "");
    },
    myTooltip(d) {
      if (this.showLabel) {
        if (this.setShown === 1) {
          this.tooltip.show(`
        <div><p>I'm a tooltip for ${d.year}! Shown if set 1 is true</div>
        <p>My properties are: ${d3.keys(d)}</p>
        `);
        } else if (this.setShown === 2) {
          this.tooltip.show(`
        <div><p>I'm a tooltip! Shown if set 2 is true</div>
        <p>My properties are: ${d3.keys(d)}</p>
         `);
        }
      } else if (!this.showLabel) {
        this.tooltip.hide();
      }
    }
  }
};
</script>

<style scoped>
/* chart */
#chart {
  margin-right: 3rem;
}
.subtitle {
  margin-bottom: 0.75rem;
  opacity: 0.7;
}

svg {
  margin-top: 0rem;
  box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
/* legend */
.legend-hidden {
  opacity: 0;
}

.legend {
  justify-content: space-between;
  padding-bottom: 0.5rem;
  margin-top: -0.5rem;
  font-size: 1.4rem;
}

/* chart elements */
div,
rect,
path,
text,
g,
circle,
line {
  transition: all 0.7s ease-in-out;
}

.circle-up {
  fill: #fff;
  stroke: #000;
  opacity: 1;
  transition: all 0.7s ease-in-out;
}
.circle-inactive {
  fill: #fff;
  stroke: #000;
  opacity: 0.3;
  transition: all 0.7s ease-in-out;
}

.circle-active {
  fill: var(--special);
  stroke: #000;
  opacity: 1;
  transition: all 0.7s ease-in-out;

  -webkit-animation: pulsing 1.5s infinite ease-in-out;
  -moz-animation: pulsing 1.5s infinite ease-in-out;
  animation: pulsing 1.5s infinite ease-in-out;
}

circle:hover {
  cursor: pointer;
}

.selector {
  stroke: var(--main-body-type);
  /* stroke: var(--special); */
  stroke-width: 3px;
  stroke-dasharray: 2;
  fill: none;
  opacity: 1;
  transition: all 0.3s ease-in-out;
}

.selector-inactive {
  stroke: var(--main-body-type);
  stroke-width: 1px;
  stroke-dasharray: 2;
  fill: none;
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.link {
  stroke: black;
  stroke-width: 2.5px;
  /* stroke-opacity: 0.8; */
  fill: none;
  opacity: 1;
  transition: all 0.7s ease-in-out;
}

.link-inactive {
  stroke: black;
  stroke-width: 2px;
  fill: none;
  opacity: 0.3;
  transition: all 0.7s ease-in-out;
}
.link-hide {
  opacity: 0;
  transition: all 0.7s ease-in-out;
}
</style>