const Promise = require('bluebird')
const List = require('prompt-list')
const Input = require('prompt-input')
const octokit = require('@octokit/rest')()
const {
  anyPass,
  concat,
  descend,
  filter,
  map,
  pickAll,
  pluck,
  prop,
  propEq,
  sortBy,
  split,
  startsWith,
} = require('ramda')

// function createComment ({
//   octokit,
//   owner,
//   issuesPaths,
//   comment,
// }) {
//   return Promise.map(issuesPaths, async function (issue) {
//     const repo = split('/', issue)[0]
//     const number = split('/', issue)[1]
//
//     const { data } = await octokit.issues.createComment({
//       owner,
//       repo,
//       number,
//       body: comment
//     })
//
//     console.log(`Your comment was created at ${repo}/${number} successfully!`)
//   })
// }

async function run () {
  const username = ''
  const token = ''
  const issues = ['247','268']

  octokit.authenticate({
    type: 'basic',
    username,
    password: token,
  })

  for (let issue of issues) {
    console.log(issue)
    const { data: events } = await octokit.issues.getEvents({
      owner: 'pagarme',
      repo: 'ghostbusters',
      number: issue,
      per_page: '100'
    })

    const filteredEvents = filter(
      anyPass([
        propEq('event', 'added_to_project'),
        propEq('event', 'moved_columns_in_project')
      ]),
      events
    )

    const eventDesiredProps = ['event', 'node_id', 'url', 'created_at']

    const response = map(
      pickAll(eventDesiredProps)
    )(filteredEvents)
    console.log(response)
  }
}

try {
  run()
} catch (err) {
  console.log(err.message)
}
