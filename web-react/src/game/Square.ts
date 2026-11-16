export class Square {
  mine: boolean
  flag = false
  click = false
  row: number
  col: number

  constructor(mine: boolean, row: number, col: number) {
    this.mine = mine
    this.row = row
    this.col = col
  }
}
