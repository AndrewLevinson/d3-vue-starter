import * as d3 from "d3";

export const wh = {
  computed: {
    width() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    }
  }
};
export const stats = {
  computed: {
    count() {
      return this.filteredData.length;
    },
    min() {
      return Math.min(...this.filteredData.map(x => x[this.lineVariable]));
    },
    max() {
      return Math.max(...this.filteredData.map(x => x[this.lineVariable]));
    },
    avg() {
      return (
        d3.sum(this.filteredData, d => d[this.lineVariable]) /
        this.filteredData.length
      );
    }
  }
};

export const scale = {
  computed: {
    scale() {
      // this.domain.x.min = Math.min(...this.filteredData.map(x => x.year));
      // this.domain.x.max = Math.max(...this.filteredData.map(x => x.year));

      const x = d3
        .scaleLinear()
        .domain([
          Math.min(...this.filteredData.map(x => x.year)),
          Math.max(...this.filteredData.map(x => x.year))
        ])
        // https://github.com/d3/d3-scale/blob/master/README.md#band_rangeRound
        .rangeRound([0, this.width]);
      // .paddingInner(1);
      const y = d3
        .scaleLinear()
        // .domain([this.domain.y.min, this.domain.y.max])
        .domain([
          Math.min(...this.filteredData.map(y => y[this.lineVariable])),
          Math.max(...this.filteredData.map(y => y[this.lineVariable]))
        ])
        .rangeRound([this.height, 0]);

      const gridLine = d3
        .scaleLinear()
        // .domain([this.domain.y.min, this.domain.y.max])
        .domain([
          Math.min(...this.filteredData.map(y => y[this.lineVariable])),
          Math.max(...this.filteredData.map(y => y[this.lineVariable]))
        ])
        .rangeRound([this.height, 0]);

      this.scaled.x = x;
      this.scaled.y = y;

      return { x, y, gridLine };
    }
  }
};

export const axis = {
  directives: {
    axis(el, binding) {
      const axis = binding.arg; // x or y
      const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // d3.axisBottom(scale.x)
      d3.select(el).call(
        d3[axisMethod](methodArg)
          .tickFormat(d3.format(binding.arg === "x" ? "d" : ",d"))
          .ticks(binding.arg === "x" ? 10 : 5)
      );
    }
  }
};

export const grid = {
  directives: {
    grid(el, binding) {
      const axis = binding.arg; // x or y
      const axisMethod = { gridLine: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // d3.axisBottom(scale.x)
      d3.select(el).call(
        d3[axisMethod](methodArg)
          .tickFormat("")
          .tickSize(-2000)
          .ticks(5)
      );
    }
  }
};
