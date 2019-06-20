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
    }
  }
};
