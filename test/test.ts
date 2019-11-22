import {currentRevision, tagForProperty} from '../src/tag';
import {tracked} from '../src/tracked';
import {render} from '../src/render';

import chai from 'chai';

class Person {
  @tracked
  firstName: string = ''

  @tracked
  lastName: string = ''

  @tracked
  salutation: string = ''

  get fullName() {
    return `${this.salutation} ${this.firstName} ${this.lastName}`
  }
}

describe('tracking changes', function() {
  it('@tracked works with regular get and set', function() {
    const person = new Person()
    person.firstName = 'Marco'
    chai.expect(person.firstName).to.equal('Marco')
  });

  it('bumps the revision when a property is set', function() {
    const person = new Person()
    const initial = currentRevision()
    chai.expect(typeof initial).to.equal('number')

    person.firstName = 'Marco'
    const revisionAfterSetting = currentRevision()
    chai.expect(revisionAfterSetting).to.be.greaterThan(initial)

    person.firstName = 'Polo'
    const revisionAfterSettingAgain = currentRevision()
    chai.expect(revisionAfterSettingAgain).to.be.greaterThan(initial)
    chai.expect(revisionAfterSettingAgain).to.be.greaterThan(revisionAfterSetting)
  })

  it('dirties a field when a property is set', function() {
    const person = new Person()
    const initial = currentRevision()
    chai.expect(typeof initial).to.equal('number')

    person.firstName = 'Marco'
    const tag = tagForProperty(person, 'firstName')
    chai.expect(tag.revision).to.be.greaterThan(tag.lastRevisionChecked)
  })

  it('can update the last checked revision', function() {
    const person = new Person()
    const initial = currentRevision()
    chai.expect(typeof initial).to.equal('number')

    person.firstName = 'Marco'
    const tag = tagForProperty(person, 'firstName')
    chai.expect(tag.revision).to.be.greaterThan(tag.lastRevisionChecked)

    tag.check()
    chai.expect(tag.revision).to.be.equal(tag.lastRevisionChecked)
  })

  it('renders with tracked properties directly', function() {
    const directPropertiesTemplate = (person: any) => `HELLO ${person.firstName} ${person.lastName}`

    const marco = new Person()
    marco.firstName = 'Marco'
    marco.lastName = 'Polo'

    console.log('kicking off 3 renders')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marco Polo')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marco Polo')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marco Polo')

    console.log('making a change')
    marco.firstName = 'Marky'
    marco.lastName = 'Mark'

    console.log('kicking off 3 more renders')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marky Mark')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marky Mark')
    chai.expect(render(marco, directPropertiesTemplate)).to.equal('HELLO Marky Mark')
  })

  it('renders with getter only', function() {
    // `fullName` is a getter and we will track changes
    // of dependencies on `fullName` by changes to `firstName` and `lastName`
    const getterTemplate = (person: any) => `HELLO ${person.fullName}`

    const marco = new Person()
    marco.salutation = 'Honourable'
    marco.firstName = 'Marco'
    marco.lastName = 'Polo'

    console.log('kicking off 3 renders')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marco Polo')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marco Polo')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marco Polo')

    console.log('making a change to firstName and lastName')
    marco.firstName = 'Marky'
    marco.lastName = 'Mark'

    console.log('kicking off 3 more renders')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marky Mark')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marky Mark')
    chai.expect(render(marco, getterTemplate)).to.equal('HELLO Honourable Marky Mark')
  })
});
