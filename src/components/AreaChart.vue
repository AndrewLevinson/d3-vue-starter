<template>
  <div id="chart">
    <h5 class="subtitle">{{ chartTitle }}</h5>
    <select v-model="lineVariable">
      <option disabled selected>Please select one</option>
      <option v-for="heads in headers" :key="heads" :value="heads">{{ heads }}</option>
    </select>
    <Stats :filteredData="filteredData" :lineVariable="lineVariable"/>

    <svg :width="svgWidth" :height="svgHeight">
      <g :transform="`translate(${margin.left}, ${margin.bottom})`" class="the-group">
        <g v-axis:x="scale" :transform="`translate(${0}, ${height})`" class="x-axis"></g>
        <g v-axis:y="scale" class="y-axis"></g>
        <g v-grid:gridLine="scale" class="grid"></g>
        <g
          class="area-active"
          @mousemove="mouseoverArea"
          @mouseleave="showLabel = false, myTooltip()"
        >
          <path v-for="(path, index) in paths" :key="index" :class="index" :d="path"></path>
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
  name: "area-chart",
  components: { Stats },
  data() {
    return {
      chartTitle: "Stacked Area Chart",
      yLabel: "Y Label",
      svgWidth: window.innerWidth * 0.45,
      svgHeight: window.innerHeight * 0.7,
      margin: { top: 50, left: 65, bottom: 20, right: 25 },
      data: [{}],
      setShown: 1,
      paths: {
        areaOne: "",
        areaTwo: "",
        areaThree: "",
        areaFour: "",
        areaFive: "",
        selector: ""
      },
      lineVariable: "priceA",
      pointsArea: [[], [], [], [], []],
      lastHoverPoint: {},
      showLabel: false,
      selected: null,
      stackedData: null,
      stackKeys: ["priceA", "priceB", "priceC"]
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
    createArea: d3
      .area()
      .x(d => d.x)
      .y0(d => d.first)
      .y1(d => d.second),
    createValueSelector: d3
      .area()
      .x(d => d.x)
      .y0(d => d.max)
      .y1(0),
    updatePath() {
      // reset area points
      this.pointsArea = [[], [], [], [], []];

      // stack area
      const stack = d3.stack();
      stack.keys(this.stackKeys);
      this.stackedData = stack(this.filteredData);

      // all areas points loop
      for (let i = 0; i < this.stackedData.length; i++) {
        for (const d of this.stackedData[i]) {
          this.pointsArea[i].push({
            x: this.scale.x(d.data.year),
            first: this.scale.y(d[0]),
            second: this.scale.y(d[1]),
            max: this.height
          });
        }
      }
      // add create area from points
      this.paths.areaOne = this.createArea(this.pointsArea[0]);
      this.paths.areaTwo = this.createArea(this.pointsArea[1]);
      this.paths.areaThree = this.createArea(this.pointsArea[2]);
      // this.paths.areaFour = this.createArea(this.pointsArea[3]);
      // this.paths.areaFive = this.createArea(this.pointsArea[4]);
    },
    mouseoverArea({ offsetX }) {
      this.showLabel = true;

      const x = offsetX - this.margin.left;
      const closestPoint = this.getClosestPoint(x);
      if (this.lastHoverPoint.index !== closestPoint.index) {
        const point = this.pointsArea[1][closestPoint.index];
        this.paths.selector = this.createValueSelector([point]);
        this.$emit(
          "mouseOver",
          this.myTooltip(this.filteredData[closestPoint.index])
        );

        this.lastHoverPoint = closestPoint;
      }
    },
    getClosestPoint(x) {
      return this.pointsArea[1]
        .map((point, index) => ({
          x: point.x,
          diff: Math.abs(point.x - x),
          index
        }))
        .reduce((memo, val) => (memo.diff < val.diff ? memo : val));
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
        <div><p>I'm a tooltip! Shown if set 1 is true</div>
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
  margin-right: 1rem;
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

.selector {
  /* stroke: var(--main-body-type); */
  stroke: black;
  stroke-width: 3px;
  stroke-dasharray: 2;
  fill: none;
  opacity: 1;
  transition: all 0.3s ease-in-out;
}

.selector-inactive {
  /* stroke: var(--main-body-type); */
  stroke: black;
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

.area-active {
  /* opacity: 1; */
  opacity: 0.8;
  transition: all 0.7s ease-in-out;
}
.area-active:hover {
  cursor: crosshair;
}
.area-hide {
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

/* areas */
.areaOne {
  fill: lightcoral;
}

.areaTwo {
  fill: lightcyan;
}

.areaThree {
  fill: lightgreen;
}
</style>