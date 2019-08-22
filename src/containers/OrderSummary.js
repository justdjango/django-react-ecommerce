import React from "react";
import {
  Container,
  Dimmer,
  Header,
  Image,
  Label,
  Loader,
  Table,
  Button,
  Message,
  Segment
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { authAxios } from "../utils";
import { orderSummaryURL } from "../constants";

class OrderSummary extends React.Component {
  state = {
    data: null,
    error: null,
    loading: false
  };

  componentDidMount() {
    this.handleFetchOrder();
  }

  handleFetchOrder = () => {
    this.setState({ loading: true });
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        this.setState({ data: res.data, loading: false });
      })
      .catch(err => {
        if (err.response.status === 404) {
          this.setState({
            error: "You currently do not have an order",
            loading: false
          });
        } else {
          this.setState({ error: err, loading: false });
        }
      });
  };

  renderVariations = orderItem => {
    let text = "";
    orderItem.item_variations.forEach(iv => {
      text += `${iv.variation.name}: ${iv.value}, `;
    });
    return text;
  };

  render() {
    const { data, error, loading } = this.state;
    return (
      <Container>
        <Header>Order Summary</Header>
        {error && (
          <Message
            error
            header="There was an error"
            content={JSON.stringify(error)}
          />
        )}
        {loading && (
          <Segment>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>

            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
          </Segment>
        )}
        {data && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                <Table.HeaderCell>Total item price</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.order_items.map((orderItem, i) => {
                return (
                  <Table.Row key={orderItem.id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>
                      {orderItem.item.title} -{" "}
                      {this.renderVariations(orderItem)}
                    </Table.Cell>
                    <Table.Cell>${orderItem.item.price}</Table.Cell>
                    <Table.Cell>{orderItem.quantity}</Table.Cell>
                    <Table.Cell>
                      {orderItem.item.discount_price && (
                        <Label color="green" ribbon>
                          ON DISCOUNT
                        </Label>
                      )}
                      ${orderItem.final_price}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              <Table.Row>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell textAlign="right" colSpan="2">
                  Order Total: ${data.total}
                </Table.Cell>
              </Table.Row>
            </Table.Body>

            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="5">
                  <Link to="/checkout">
                    <Button floated="right" color="yellow">
                      Checkout
                    </Button>
                  </Link>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        )}
      </Container>
    );
  }
}

export default OrderSummary;
