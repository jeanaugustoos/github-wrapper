const Promise = require('bluebird')
const List = require('prompt-list')
const Input = require('prompt-input')
const octokit = require('@octokit/rest')()
const {
  concat,
  map,
  pluck,
  split,
  startsWith,
} = require('ramda')

function createComment ({
  octokit,
  owner,
  issuesPaths,
  comment,
}) {
  return Promise.map(issuesPaths, async function (issue) {
    const repo = split('/', issue)[0]
    const number = split('/', issue)[1]

    const { data } = await octokit.issues.createComment({
      owner,
      repo,
      number,
      body: comment
    })

    console.log(`Your comment was created at ${repo}/${number} successfully!`)
  })
}

async function run () {
  const username = await new Input({
    name: 'username',
    message: 'What is your Github username?',
  }).run()

  const token = await new Input({
    name: 'token',
    message: 'Enter your Github token, please!',
  }).run()

  octokit.authenticate({
    type: 'basic',
    username,
    password: token,
  })

  const { data: orgsResponse } = await octokit.users.getOrgs()

  const orgs = pluck('login', orgsResponse)

  const org = await new List({
    name: 'org',
    message: 'Select an organization',
    choices: orgs,
  }).run()

  const task = await new List({
    name: 'task',
    message: 'Select a type of task',
    choices: [
      '1. Send a comment to multiples issues in a specific repo',
      '2. Send a comment to specific paths',
    ],
  }).run()

  let issuesPaths

  if (startsWith('1', task)) {
    const repo = await new Input({
      name: 'repo',
      message: 'Inform the name of the repo',
    }).run()

    if (!repo) return

    const issues = await new Input({
      name: 'issue',
      message: 'Inform the issue that you want to send a comment (for multiple issues separate them by comma)',
    }).run()

    if (!issues) return

    issuesPaths = map(
      concat(`${repo}/`),
      split(',', issues)
    )
  } else {
    const issues = await new Input({
      name: 'issues-paths',
      message: 'Inform the repo and issue (roadmap/123) that you want to send a comment (for multiple separate them by comma)',
    }).run()

    if (!issues) return

    issuesPaths = split(',', issues)
  }

  const comment = await new Input({
    name: 'comment',
    message: 'Type your comment:',
  }).run()

  await createComment({
    octokit,
    owner: org,
    issuesPaths,
    comment,
  })
}

run()
