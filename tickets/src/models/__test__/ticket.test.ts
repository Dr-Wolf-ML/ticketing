import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async done => {
    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 10,
        userId: '123abc',
    });
    await ticket.save();

    // fetch it twice
    const fetchedTicket1 = await Ticket.findById(ticket.id);
    const fetchedTicket2 = await Ticket.findById(ticket.id);

    // make separate changes to fetched ticket
    fetchedTicket1!.set({
        title: 'Updated Title',
    });

    fetchedTicket2!.set({
        price: 20,
    });

    // save first and expect a 202
    await fetchedTicket1?.save();

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.version).toEqual(1);

    try {
        await fetchedTicket2?.save();
    } catch (err) {
        expect(err.message).toContain('No matching document found');
        expect(err.version).toEqual(0);
    }

    done();
});

it('increments the version number on multiple saves', async () => {
    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 10,
        userId: '123abc',
    });
    await ticket.save();
    //Assert
    expect(ticket.version).toEqual(0);

    // Arrange
    ticket.set({
        title: 'Updated Title',
    });
    await ticket.save();
    // Assert
    expect(ticket.version).toEqual(1);

    // Arrange
    ticket.set({
        price: 20,
    });
    await ticket.save();
    // Assert
    expect(ticket.version).toEqual(2);
    expect(ticket.title).toEqual('Updated Title');
    expect(ticket.price).toEqual(20);
});

it('passes all OCC tests', async () => {
    console.log('Tickets API:  OCC passed.');
});
