<template>
  <div id="chart">
    <h4 class="subtitle">{{ chartTitle }}</h4>
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
        <path
          :class="[showCallOut && setShown === 1 ? 'link-inactive' : (setShown === 1 ? 'link' : 'link-hide')]"
          :d="paths.line"
        ></path>
        <g
          :class="[showArea ? 'area-active' : 'area-hide']"
          @mousemove="mouseoverArea"
          @mouseleave="showLabel = false, myTooltip()"
        >
          <path v-show="setShown != 1" class="selector" :d="paths.selector"></path>
          <path :class="[setShown === 1 ? 'area-one' : 'area-one-100']" :d="paths.areaOne"></path>
          <path :class="[setShown === 1 ? 'area-two' : 'area-two-100']" :d="paths.areaTwo"></path>
          <path :class="[setShown === 1 ? 'area-three' : 'area-three-100']" :d="paths.areaThree"></path>
          <path :class="[setShown === 1 ? 'area-one' : 'area-four-100']" :d="paths.areaFour"></path>
          <path :class="[setShown === 1 ? 'area-one' : 'area-five-100']" :d="paths.areaFive"></path>
        </g>
        <g v-for="(d, i) in filteredData" :key="i">
          <line
            v-if="setShown === 1"
            :x1="scale.x(d.year)"
            :y1="scale.y(d.priceB)"
            :x2="scale.x(d.year)"
            :y2="height"
            :class="[i == selected ? 'selector' : 'selector-inactive']"
          ></line>
          <circle
            v-if="setShown === 1"
            :class="[i == selected ? 'circle-active' : (showCallOut ? 'circle-inactive' : 'circle-up')]"
            :cx="scale.x(d.year)"
            :cy="[setShown === 1 ? scale.y(d[lineVariable]) : scale.y(1)]"
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
import { wh, axis, grid, scale } from "../mixins/myMixin.js";
import Stats from "./Stats.vue";

export default {
  name: "chart-one",
  components: { Stats },
  data() {
    return {
      chartTitle: "Starter Chart with D3 and Vue.js",
      yLabel: "Y Label",
      svgWidth: window.innerWidth * 0.45,
      svgHeight: window.innerHeight * 0.725,
      margin: { top: 50, left: 65, bottom: 20, right: 25 },
      data: [{}],
      stackedData: null,
      scaled: {
        x: null,
        y: null,
        color: null
      },
      paths: {
        line: "",
        areaOne: "",
        areaTwo: "",
        areaThree: "",
        areaFour: "",
        areaFive: "",
        selector: ""
      },
      pointsLine: [],
      pointsArea: [[], [], [], [], []],
      lastHoverPoint: {},
      lineVariable: "priceA",
      showLabel: false,
      selected: null,
      selectedArea: null,
      showCallOut: false,
      myCount: null,
      tooltip: null,
      showArea: false,
      domain: {
        x: {
          min: 1985,
          max: 2015
        },
        y: {
          min: 0,
          max: 100
        }
      },
      stackKeys: ["gpc", "spc", "dpc"],
      setShown: 1
    };
  },
  mixins: [axis, grid, wh, scale],
  computed: {
    filteredData() {
      // return this.data.filter(d => d.set === this.setShown);
      return this.data;
    },
    headers() {
      return d3.keys(this.data[0]);
    }
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.initTooltip();
  },
  updated() {
    // console.log("im updated");
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
      // reset line points
      this.pointsLine = [];

      // line
      for (const d of this.filteredData) {
        this.pointsLine.push({
          x: this.scaled.x(d.year),
          y: this.scaled.y(d[this.lineVariable]),
          max: this.height
        });
      }
      this.paths.line = this.createLine(this.pointsLine);

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
            x: this.scaled.x(d.data.year),
            first: this.scaled.y(d[0]),
            second: this.scaled.y(d[1]),
            max: this.height
          });
        }
      }
      // add create area from points
      this.paths.areaOne = this.createArea(this.pointsArea[0]);
      this.paths.areaTwo = this.createArea(this.pointsArea[1]);
      this.paths.areaThree = this.createArea(this.pointsArea[2]);
      this.paths.areaFour = this.createArea(this.pointsArea[3]);
      this.paths.areaFive = this.createArea(this.pointsArea[4]);
    },
    mouseoverArea({ offsetX }) {
      this.showLabel = true;
      if (this.setShown != 1 && this.pointsArea[1].length > 0) {
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
    selectArea(index) {
      this.selectedArea = index;
    },
    numFormater(type, el) {
      const numFormatT = d3.format(",d");
      return numFormatT(el) + (type === "per" ? "%" : "");
    },
    initTooltip() {
      this.tooltip = {
        element: null,
        init: function() {
          this.element = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        },
        show: function(t) {
          this.element
            .html(t)
            .transition()
            .duration(200)
            .style(
              "left",
              `${
                event.clientX > window.innerWidth * 0.5
                  ? event.clientX - 250
                  : event.clientX + 10
              }px`
            )
            .style("top", `50vh`)
            .style("opacity", 0.925);
        },
        move: function() {
          this.element
            .transition()
            .duration(30)
            .style("left", `${event.clientX + 10}px`)
            .style("top", `50vh`)
            .style("opacity", 0.9);
        },
        hide: function() {
          this.element
            .transition()
            .duration(500)
            .style("opacity", 0)
            .delay(100);
        }
      };
      this.tooltip.init();
    },
    myTooltip(d) {
      if (this.showLabel) {
        if (this.setShown === 1) {
          this.tooltip.show(`
        <div class="tip-band"></div>
        <h5 class="datum">${d.year}</h5>
        <h6 class="sub-head-tip">Renewable Water Per Capita<br>(m3/year/person)</h6>
          <div class="data-pair area-three tip-tag">
            <span class="tag-intext">Dependencies</span>
            <p class="tag-intext">
              ${this.numFormater("num", d.dpc)}
            </p>
          </div>
      
          <div class="data-pair area-two tip-tag">
            <span class="tag-intext">Surface Water</span>
            <p class="tag-intext">
              ${this.numFormater("num", d.spc)}
            </p>
          </div>

          <div class="data-pair area-one tip-tag">
            <span class="tag-intext">Groundwater</span>
            <p class="tag-intext">
              ${this.numFormater("num", d.gpc)}
            </p>
          </div>

       
          <div class="data-pair tip-tag">
            <span class="datum total">Total</span>
            <p class="total">
              ${this.numFormater("num", d.rwpc)}
            </p>
          </div>
        `);
        } else if (this.setShown === 2) {
          this.tooltip.show(`
        <div class="tip-band"></div>
        <h5 class="datum">${d.year}</h5>
        <h6 class="sub-head-tip">Percentage of Water Withdrawls</h6>

          <div class="data-pair area-five-100 tip-tag">
            <span class="tag-intext">Other</span>
            <p class="tag-intext">
            ${this.numFormater("per", d.otherPer)}
            </p>
          </div>


          <div class="data-pair area-four-100 tip-tag">
            <span class="tag-intext">Industrial</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.industrialPer)}
            </p>
          </div>

          <div class="data-pair area-three-100 tip-tag">
            <span class="tag-intext">Municipal</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.publicPer)}
            </p>
          </div>

          <div class="data-pair area-two-100 tip-tag">
            <span class="tag-intext">Irrigation</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.irrigationPer)}
            </p>
          </div>

       <div class="data-pair area-one-100 tip-tag">
            <span class="tag-intext">Thermoelectric</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.thermoPer)}
            </p>
          </div>
         `);
        } else if (this.setShown === 3) {
          this.tooltip.show(`
        <div class="tip-band"></div>
        <h5 class="datum">${d.year}</h5>
        <h6 class="sub-head-tip">Percentage of Water Withdrawls</h6>

          <div class="data-pair area-five-100 tip-tag">
            <span class="tag-intext">Other</span>
            <p class="tag-intext">
            ${this.numFormater("per", d.otherPer)}
            </p>
          </div>


          <div class="data-pair area-four-100 tip-tag">
            <span class="tag-intext">Industrial</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.industrialPer)}
            </p>
          </div>

          <div class="data-pair area-three-100 tip-tag">
            <span class="tag-intext">Municipal</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.publicPer)}
            </p>
          </div>

          <div class="data-pair area-two-100 tip-tag">
            <span class="tag-intext">Irrigation</span>
            <p class="tag-intext">
              ${this.numFormater("per", d.irrigationPer)}
            </p>
          </div>

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
  width: 95%;
  margin: 0 auto;
}
.subtitle {
  margin-top: 3rem;
}

svg {
  margin-top: 0rem;
  box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.3);
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

.circle-group {
  opacity: 1;
  transition: all 0.7s ease-in-out;
  transform-origin: left top;
}
.circle-group-hide {
  opacity: 0;
  transition: all 0.7s ease-in-out;
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

.area-active {
  opacity: 1;
  transition: all 0.7s ease-in-out;
}
.area-active:hover {
  cursor: crosshair;
}
.area-hide {
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

/* all blues */
/* .area-one {
  fill: var(--ground);
  background-color: var(--ground);
}

.area-two {
  fill: var(--surface);
  background-color: var(--surface);
}

.area-three {
  fill: var(--dep);
  background-color: var(--dep);
} */

/* ordinal */
.area-one-100 {
  fill: var(--irrigation);
  background-color: var(--irrigation);
}

.area-two-100 {
  fill: var(--thermo);
  background-color: var(--thermo);
}

.area-three-100 {
  fill: var(--industrial);
  background-color: var(--industrial);
}

.area-four-100 {
  fill: var(--municipal);
  background-color: var(--municipal);
}

.area-five-100 {
  fill: var(--other);
  background-color: var(--other);
}
</style>