<script setup lang="ts">
const site = useSite()

const intro = `${site.name} is a registered charity (Number ${site.charityNumber}). The hall is managed by Trustees and a Management Committee.`

useSeoMeta({ title: 'The Committee', description: intro })
</script>

<template>
  <article class="mx-auto w-full max-w-4xl">
    <PageHeader title="The Committee" :intro="intro" />

    <div class="prose mt-10 max-w-none prose-stone dark:prose-invert">
      <h2>Background</h2>
      <p>St. Michael's Hall was originally constructed in 1911 by the widowed Mrs Henry Lannoy Hunter of Beech Hill, as a memorial to her late husband, for the use and enjoyment of the inhabitants of the Parish of Spencers Wood. In 1948 their daughter, Mary Charlotte Hunter, made this intention more permanent by officially donating the Hall and land to a group of trustees to manage on behalf of the residents of the Parish.</p>
      <p>In 1984 an extension to the Hall was undertaken resulting in the Wellington Room, disabled toilet and extended kitchen.</p>
      <p>In 1991 the Charity Commission approved and sealed a revision to the original Trust Schedule, which acknowledged the name of the Hall as the more familiar "Spencers Wood Village Hall" and recognised the new representatives of the Governing Committee.</p>

      <h2>Summary of the Governing Scheme</h2>
      <p>A brief summary of the documents follows:</p>
      <ul>
        <li>The land and hall are owned outright (freehold) by the residents of Spencers Wood, but everything is overseen and approved by the Charity Commission.</li>
        <li>The purpose of the Hall was for meetings, lectures, and classes and other recreations and entertainment as would benefit the community of Spencers Wood without distinction of political, religious or other opinions.</li>
      </ul>

      <h2>Responsibilities of Trustees</h2>
      <p>The Village Hall has two sets of Trustees:</p>
      <h3>(I) Custodian Trustees</h3>
      <p>The Custodian Trustee is the Official Custodian of Charities – The Charity Commission.</p>
      <p>The Hall is vested in Custodian Trustees and their responsibility is simply to hold the legal title of the Charity's property and to act on the lawful directions of the Committee in any transactions affecting this title.</p>
      <h3>(II) Managing Trustees</h3>
      <p>The Managing Trustees are the members of the Management Committee.</p>
      <p>They are responsible for the day to day management of the Village Hall Charity, in accordance with its governing scheme. The majority of England's 8,500 village halls are managed in this way and few problems are experienced so long as committee members manage the building with all reasonable care and prudence, in the same way that they manage their own affairs.</p>

      <h2>Committee composition and meetings</h2>
      <p>The Committee consists of up to 13 members in total, some of whom are nominated by organisations in the village regularly using the hall and up to 4 are elected at our Annual General Meeting. We are allowed to co-opt up to another 2 members as the Committee sees fit. We meet monthly. We elect a number of officers from within our members.</p>
    </div>
  </article>
</template>
