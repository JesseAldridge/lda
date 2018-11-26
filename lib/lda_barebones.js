
function State() {
  // the cat is fierce
  // the mouse is meek
  // the leopard is fierce

  this.initial_strings = [
    'cats are small',
    'dogs are big',
    'cats like to chase mice',
    'dogs like to eat bones'
  ]

  this.alpha = .1
  this.beta = .01
  this.K = 2 // num topics

  this.token_to_topic_counts = {}
  this.documents = []
  for(let s of initial_strings) {
    const doc = []
    this.documents.push(doc)
    const z_row = []
    this.z.push(z_row)
    for(let token of s.split(' ')) {
      if(!this.token_to_topic_counts[token])
        this.token_to_topic_counts[token] = [0, 0]
      this.v[token] = 1
      this.documents.push(token)
      z_row.push(Math.floor(Math.random() * K))
    }
  }
  this.V = this.v.length

  this.nw = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ]
  this.nd = [
    [0, 0],
    [0, 0],
    [0, 0]
  ]
  this.nwsum = [0, 0]
  this.ndsum = [0, 0, 0]
  for (var m = 0; m < this.z.length; m++) {
    for (var n = 0; n < this.z[m].length; n++) {
        var topic = this.z[m][n];
        this.nw[this.documents[m][n]][topic]++  // number of times this word occurs under this topic
        this.nd[m][topic]++ // number of times this document occurs under this topic
        this.nwsum[topic]++ // number of times this topic occurs globally
    }
    this.ndsum[m] = this.z[m].length; // the number of words in this document
  }
}

function varlog(label, val) {
  let val_str = null
  if(val instanceof Array && val.length > 0 && val[0] instanceof Array) {
    const val_copy = []
    for(let i = 0; i < val.length; i++)
      val_copy.push(('' + val[i]).trim())
    val_str = val_copy.join('\n')
  }
  else
    val_str = val
  console.log(label, val_str)
}

function sampleFullConditional(m,n,state) {
  var topic = state.z[m][n]
  varlog('newline:', '')
  varlog('word:', state.v[state.documents[m][n]])
  varlog('old_topic:', topic)
  // remove the current word from the aggregations
  state.nw[state.documents[m][n]][topic]--;
  state.nd[m][topic]--;
  state.nwsum[topic]--;
  state.ndsum[m]--;

  varlog('nw:', state.nw)
  varlog('nd:', state.nd)
  varlog('nwsum:', state.nwsum)
  varlog('ndsum:', state.ndsum)
  varlog('z:', state.z)

  var p = [];
  for (var k = 0; k < state.K; k++) {
    const word_topic_weight = state.nw[state.documents[m][n]][k] + state.beta,
          global_topic_weight = state.nwsum[k] + state.V * state.beta,
          doc_topic_weight = state.nd[m][k] + state.alpha,
          doc_max_weight = state.ndsum[m] + state.K * state.alpha
    varlog('word_topic_weight:', word_topic_weight)
    varlog('global_topic_weight:', global_topic_weight)
    varlog('doc_topic_weight:', doc_topic_weight)
    varlog('doc_max_weight:', doc_max_weight)
    p[k] = word_topic_weight / global_topic_weight * doc_topic_weight / doc_max_weight
  }

  varlog('p:', p)

  for (var k = 1; k < p.length; k++) { // [.2, .3, .5] -> [.2, .5, 1.0]
      p[k] += p[k - 1];
  }
  var u = Math.random() * p[state.K - 1];
  for (topic = 0; topic < p.length; topic++) {
      if (u < p[topic])
          break;
  }
  state.nw[state.documents[m][n]][topic]++;
  state.nd[m][topic]++;
  state.nwsum[topic]++;
  state.ndsum[m]++;
  return topic;
}

function main() {
  const state = new State()
  const ITERATIONS = 3
  for (let i = 0; i < ITERATIONS; i++)
    for (let m = 0; m < state.z.length; m++)
      for (let n = 0; n < state.z[m].length; n++)
        state.z[m][n] = sampleFullConditional(m, n, state)
  varlog('final z:', state.z)
}

main()
